<?php

namespace App\Http\Controllers;

use App\Models\PosNote;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PosNoteController extends Controller
{
    public function getDays()
    {
        $user = Auth::user();

        $days = PosNote::where('user_id', $user->id)
            ->selectRaw('
                DATE(note_date) as note_date, 
                COUNT(*) as note_count, 
                SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed_count
            ')
            ->groupByRaw('DATE(note_date)')
            ->orderByRaw('DATE(note_date) asc')
            ->get()
            ->map(function ($day) {
                $totalNotes = (int) $day->note_count;
                $completedNotes = (int) $day->completed_count;
                $isAllCompleted = $totalNotes > 0 && $completedNotes === $totalNotes;
                $completionPercentage = $totalNotes > 0 ? round(($completedNotes / $totalNotes) * 100) : 0;

                return [
                    'date' => Carbon::parse($day->note_date)->format('Y-m-d'),
                    'formatted_date' => Carbon::parse($day->note_date)->format('M d, Y'),
                    'note_count' => $totalNotes,
                    'completed_count' => $completedNotes,
                    'is_all_completed' => $isAllCompleted,
                    'completion_percentage' => $completionPercentage,
                ];
            });

        return response()->json($days);
    }

    public function getNotesByDay(Request $request)
    {
        $user = Auth::user();
        $date = $request->input('date');

        // Frontend now sends only date (YYYY-MM-DD), no timestamp
        $dateOnly = $date;

        $notes = PosNote::where('user_id', $user->id)
            ->where('note_date', $dateOnly)
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($note) {
                return [
                    'id' => $note->id,
                    'note_text' => $note->note_text,
                    'audio_path' => $note->audio_path,
                    'audio_url' => $note->audio_path ? asset('storage/'.$note->audio_path) : null,
                    'is_completed' => $note->is_completed,
                    'completed_at' => $note->completed_at ? $note->completed_at->format('H:i') : null,
                    'created_at' => $note->created_at->format('H:i'),
                    'timestamp' => $note->created_at->toISOString(),
                    'note_date' => $note->note_date,
                ];
            });

        return response()->json($notes);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        try {
            $request->validate([
                'note_text' => 'nullable|string',
                'audio_file' => 'nullable|file|mimes:wav,mp3,m4a,ogg,webm|max:10240', // Max 10MB
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Audio upload validation failed:', [
                'errors' => $e->errors(),
                'request_data' => $request->all(),
                'has_file' => $request->hasFile('audio_file'),
                'file_info' => $request->hasFile('audio_file') ? [
                    'original_name' => $request->file('audio_file')->getClientOriginalName(),
                    'mime_type' => $request->file('audio_file')->getMimeType(),
                    'size' => $request->file('audio_file')->getSize(),
                ] : null,
            ]);
            throw $e;
        }

        // At least one of note_text or audio_file must be provided
        if (! $request->note_text && ! $request->hasFile('audio_file')) {
            return response()->json(['error' => 'Either note text or audio is required'], 400);
        }

        $audioPath = null;
        if ($request->hasFile('audio_file')) {
            // Store audio file in storage/app/public/voice_notes
            $audioPath = $request->file('audio_file')->store('voice_notes', 'public');
        }

        $note = PosNote::create([
            'note_text' => $request->note_text,
            'audio_path' => $audioPath,
            'note_date' => Carbon::today()->format('Y-m-d'),
            'user_id' => $user->id,
        ]);

        return response()->json([
            'id' => $note->id,
            'note_text' => $note->note_text,
            'audio_path' => $note->audio_path,
            'audio_url' => $note->audio_path ? asset('storage/'.$note->audio_path) : null,
            'is_completed' => false,
            'completed_at' => null,
            'created_at' => $note->created_at->format('H:i'),
            'timestamp' => $note->created_at->toISOString(),
            'note_date' => $note->note_date,
        ]);
    }

    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'note_text' => 'nullable|string|max:1000',
                'audio_file' => 'nullable|file|mimes:wav,mp3,m4a,ogg,webm|max:10240',
            ]);

            $user = Auth::user();
            $note = PosNote::where('id', $id)
                ->where('user_id', $user->id)
                ->first();

            if (! $note) {
                return response()->json(['success' => false, 'message' => 'Note not found'], 404);
            }

            // Handle audio file update
            $audioPath = $note->audio_path; // Keep existing audio by default
            if ($request->hasFile('audio_file')) {
                // Delete old audio file if exists
                if ($note->audio_path && \Storage::disk('public')->exists($note->audio_path)) {
                    \Storage::disk('public')->delete($note->audio_path);
                }
                // Store new audio file
                $audioPath = $request->file('audio_file')->store('voice_notes', 'public');
            }

            $note->update([
                'note_text' => $request->note_text,
                'audio_path' => $audioPath,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Note updated successfully',
                'note' => [
                    'id' => $note->id,
                    'note_text' => $note->note_text,
                    'audio_path' => $note->audio_path,
                    'audio_url' => $note->audio_path ? asset('storage/'.$note->audio_path) : null,
                    'is_completed' => $note->is_completed,
                    'completed_at' => $note->completed_at ? $note->completed_at->format('H:i') : null,
                    'created_at' => $note->created_at->format('H:i'),
                    'timestamp' => $note->created_at->toISOString(),
                    'note_date' => $note->note_date,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to update note'], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $user = Auth::user();

            $note = PosNote::where('user_id', $user->id)->findOrFail($id);
            $note->delete(); // This will be a soft delete now

            return response()->json([
                'success' => true,
                'message' => 'Note deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete note',
            ], 500);
        }
    }

    public function restore($id)
    {
        try {
            $user = Auth::user();

            $note = PosNote::withTrashed()
                ->where('user_id', $user->id)
                ->findOrFail($id);

            $note->restore();

            return response()->json([
                'success' => true,
                'message' => 'Note restored successfully',
                'note' => $note,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore note',
            ], 500);
        }
    }

    public function getTrashedNotes()
    {
        try {
            $user = Auth::user();

            $trashedNotes = PosNote::onlyTrashed()
                ->where('user_id', $user->id)
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($note) {
                    return [
                        'id' => $note->id,
                        'note_text' => $note->note_text,
                        'audio_path' => $note->audio_path,
                        'audio_url' => $note->audio_path ? asset('storage/'.$note->audio_path) : null,
                        'note_date' => $note->note_date,
                        'created_at' => $note->created_at->format('M d, Y H:i'),
                        'deleted_at' => $note->deleted_at->format('M d, Y H:i'),
                    ];
                });

            return response()->json([
                'success' => true,
                'notes' => $trashedNotes,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch trashed notes',
            ], 500);
        }
    }

    public function forceDelete($id)
    {
        try {
            $user = Auth::user();

            $note = PosNote::withTrashed()
                ->where('user_id', $user->id)
                ->findOrFail($id);

            // Delete audio file if exists
            if ($note->audio_path && \Storage::disk('public')->exists($note->audio_path)) {
                \Storage::disk('public')->delete($note->audio_path);
            }

            $note->forceDelete(); // Permanently delete

            return response()->json([
                'success' => true,
                'message' => 'Note permanently deleted',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete note',
            ], 500);
        }
    }

    public function toggleComplete($id)
    {
        try {
            $user = Auth::user();

            $note = PosNote::where('user_id', $user->id)->findOrFail($id);

            $note->is_completed = ! $note->is_completed;
            $note->completed_at = $note->is_completed ? now() : null;
            $note->save();

            return response()->json([
                'success' => true,
                'message' => $note->is_completed ? 'Todo marked as completed' : 'Todo marked as incomplete',
                'note' => $note,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update todo status',
            ], 500);
        }
    }
}
