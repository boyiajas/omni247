<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\Request;

class DeviceController extends Controller
{
    public function index(Request $request)
    {
        $query = UserDevice::with('user:id,name,email,role')
            ->orderByDesc('last_active_at');

        if ($userId = $request->query('user_id')) {
            $query->where('user_id', $userId);
        }

        if ($type = $request->query('device_type')) {
            $query->where('device_type', $type);
        }

        return response()->json(
            $query->paginate($request->integer('per_page', 20))
        );
    }

    public function destroy($id)
    {
        $device = UserDevice::findOrFail($id);
        $device->delete();

        return response()->json([
            'success' => true,
            'message' => 'Device deleted successfully',
        ]);
    }
}
