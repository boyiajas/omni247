<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Jobs\VerifyMediaJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function upload(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,mp4,mov,avi,mp3,wav|max:10240',
            'type' => 'required|in:image,video,audio',
        ]);

        $file = $request->file('file');
        $type = $validated['type'];
        
        // Generate unique filename
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = "{$type}s/" . date('Y/m/d');
        
        // Store file
        $url = Storage::disk('public')->putFileAs($path, $file, $filename);
        // Use url() helper to get full absolute URL
        $fullUrl = url('/storage/' . $url);

        // Get file metadata
        $metadata = [
            'original_name' => $file->getClientOriginalName(),
            'size_mb' => round($file->getSize() / 1024 / 1024, 2),
        ];

        // Create thumbnail for images/videos
        $thumbnailUrl = null;
        if (in_array($type, ['image', 'video'])) {
            // Thumbnail generation logic would go here
            $thumbnailUrl = $fullUrl; // Placeholder
        }

        // Get dimensions for images
        $width = null;
        $height = null;
        if ($type === 'image') {
            [$width, $height] = getimagesize($file->getRealPath());
        }

        $media = Media::create([
            'report_id' => $validated['report_id'],
            'type' => $type,
            'url' => $fullUrl,
            'thumbnail_url' => $thumbnailUrl,
            'filename' => $filename,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'width' => $width,
            'height' => $height,
            'metadata' => $metadata,
        ]);

        // Dispatch verification job (optional, don't fail if queue service unavailable)
        try {
            VerifyMediaJob::dispatch($media);
        } catch (\Exception $e) {
            // Log but don't fail - media was already uploaded
            \Log::warning('Failed to dispatch VerifyMediaJob: ' . $e->getMessage());
        }

        return response()->json($media, 201);
    }

    public function show($id)
    {
        $media = Media::findOrFail($id);
        return response()->json($media);
    }

    public function destroy($id)
    {
        $media = Media::findOrFail($id);
        
        $this->authorize('delete', $media);

        // Delete file from storage
        Storage::disk('public')->delete($media->url);
        if ($media->thumbnail_url) {
            Storage::disk('public')->delete($media->thumbnail_url);
        }

        $media->delete();

        return response()->json(['message' => 'Media deleted successfully']);
    }
}
