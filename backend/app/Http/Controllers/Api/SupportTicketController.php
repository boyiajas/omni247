<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class SupportTicketController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->bearerToken()) {
            $token = PersonalAccessToken::findToken($request->bearerToken());
            $user = $token?->tokenable;
        }

        \Log::info('Support ticket submission received', [
            'data' => $request->all(),
            'user_id' => $user?->id,
        ]);

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Support ticket validation failed', [
                'errors' => $validator->errors()->toArray(),
            ]);
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $ticket = SupportTicket::create([
            'user_id' => $user?->id,
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
            'status' => 'open',
            'priority' => 'medium',
        ]);

        \Log::info('Support ticket created successfully', [
            'ticket_id' => $ticket->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Support ticket submitted successfully',
            'data' => $ticket,
        ], 201);
    }

    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'assignedTo'])
            ->where('user_id', auth()->id())
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $tickets = $query->paginate($request->integer('per_page', 15));

        return response()->json($tickets);
    }

    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'assignedTo'])
            ->where('user_id', auth()->id())
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $ticket,
        ]);
    }
}
