<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'assignedTo:id,name']);

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($priority = $request->query('priority')) {
            $query->where('priority', $priority);
        }

        if ($search = $request->query('search')) {
            $query->where(function($q) use ($search) {
                $q->where('subject', 'LIKE', "%{$search}%")
                  ->orWhere('email', 'LIKE', "%{$search}%")
                  ->orWhere('name', 'LIKE', "%{$search}%");
            });
        }

        $tickets = $query->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 25));

        return response()->json($tickets);
    }

    public function show($id)
    {
        $ticket = SupportTicket::with(['user', 'assignedTo'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $ticket,
        ]);
    }

    public function update(Request $request, $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        
        // Store original values to detect changes
        $originalStatus = $ticket->status;
        $originalNotes = $ticket->admin_notes;

        $validated = $request->validate([
            'status' => 'sometimes|in:open,in_progress,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'admin_notes' => 'nullable|string',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'resolved' && !$ticket->resolved_at) {
            $validated['resolved_at'] = now();
        }

        $ticket->update($validated);

        // Send notifications to the user who created the ticket
        if ($ticket->user_id) {
            $user = $ticket->user;
            
            // Notification for status change
            if (isset($validated['status']) && $originalStatus !== $validated['status']) {
                $statusLabels = [
                    'open' => 'Open',
                    'in_progress' => 'In Progress',
                    'resolved' => 'Resolved',
                    'closed' => 'Closed',
                ];
                
                $notification = \App\Models\Notification::create([
                    'user_id' => $user->id,
                    'type' => 'support_ticket',
                    'title' => 'Support Ticket Updated',
                    'body' => "Your support ticket '{$ticket->subject}' status has been changed to {$statusLabels[$validated['status']]}",
                    'data' => [
                        'ticket_id' => $ticket->id,
                        'status' => $validated['status'],
                    ],
                ]);

                // Broadcast notification via WebSocket (Reverb/Echo)
                event(new \App\Events\NotificationCreatedEvent($notification));
            }
            
            // Notification for admin notes added/updated
            if (isset($validated['admin_notes']) && $originalNotes !== $validated['admin_notes'] && !empty($validated['admin_notes'])) {
                $notification = \App\Models\Notification::create([
                    'user_id' => $user->id,
                    'type' => 'support_ticket',
                    'title' => 'Support Ticket Note Added',
                    'body' => "An admin has added a note to your support ticket '{$ticket->subject}'",
                    'data' => [
                        'ticket_id' => $ticket->id,
                        'has_notes' => true,
                    ],
                ]);

                // Broadcast notification via WebSocket (Reverb/Echo)
                event(new \App\Events\NotificationCreatedEvent($notification));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Ticket updated successfully',
            'data' => $ticket->load(['user', 'assignedTo']),
        ]);
    }

    public function destroy($id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ticket deleted successfully',
        ]);
    }

    public function stats()
    {
        $stats = [
            'total' => SupportTicket::count(),
            'open' => SupportTicket::where('status', 'open')->count(),
            'in_progress' => SupportTicket::where('status', 'in_progress')->count(),
            'resolved' => SupportTicket::where('status', 'resolved')->count(),
            'closed' => SupportTicket::where('status', 'closed')->count(),
            'high_priority' => SupportTicket::where('priority', 'high')->orWhere('priority', 'urgent')->count(),
        ];

        return response()->json($stats);
    }
}
