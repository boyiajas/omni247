<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Audit;
use Illuminate\Http\Request;

class AuditController extends Controller
{
    public function index(Request $request)
    {
        $query = Audit::with('user:id,name,email');

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($email = $request->query('email')) {
            $query->whereHas('user', function($q) use ($email) {
                $q->where('email', 'LIKE', "%{$email}%");
            });
        }

        if ($startDate = $request->query('start_date')) {
            $query->whereDate('created_at', '>=', $startDate);
        }

        if ($endDate = $request->query('end_date')) {
            $query->whereDate('created_at', '<=', $endDate);
        }

        return response()->json(
            $query->orderByDesc('created_at')->paginate($request->integer('per_page', 25))
        );
    }
}
