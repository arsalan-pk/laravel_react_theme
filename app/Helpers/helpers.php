<?php

if (!function_exists('formatPermissions')) {
    /**
     * Format permissions by grouping them
     *
     * @param \Illuminate\Support\Collection $permissions
     * @return array
     */
    function formatPermissions($permissions)
    {
        $permissionGroups = [];
        foreach ($permissions as $permission) {
            $permissionGroups[$permission->group][] = $permission;
        }
        return $permissionGroups;
    }
}

if (!function_exists('keyToString')) {
    /**
     * Convert key to string format
     *
     * @param string $key
     * @param bool $reverse
     * @return string
     */
    function keyToString($key, $reverse = false)
    {
        if ($reverse) {
            return str_replace([' ', "'"], '_', strtolower($key));
        } else {
            return str_replace(['_', '-'], ' ', strtolower($key));
        }
    }
}

if (!function_exists('getAssignedPermissionsCount')) {
    /**
     * Get count of assigned permissions for a role in a specific group
     *
     * @param \Spatie\Permission\Models\Role $role
     * @param string $group
     * @return int
     */
    function getAssignedPermissionsCount($role, $group)
    {
        $assinged_permissions = $role->permissions->groupBy('group');
        return isset($assinged_permissions[$group]) ? $assinged_permissions[$group]->count() : 0;
    }
}

