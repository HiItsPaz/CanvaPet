import { renderHook, act } from '@testing-library/react';
import { usePortraitRevisionHistory } from '../usePortraitRevisionHistory';
import { GalleryPortrait } from '@/types/gallery';
import { PortraitRevision, PortraitParameters } from '@/lib/ai/openai';

/// <reference types="jest" />

// Mock data for testing
const mockOriginalPortrait: GalleryPortrait = {
  id: 'original-id',
  user_id: 'user-1',
  created_at: '2023-01-01T10:00:00Z',
  processed_image_url: 'original-url',
  pet_id: 'pet-1',
  customization_params: {
    petId: 'pet-1' as unknown,
    userId: 'user-1' as unknown,
    artStyle: '' as unknown,
    background: '' as unknown,
    orientation: 'portrait' as unknown,
    styleIntensity: 0 as unknown,
    accessories: [] as unknown,
    backgroundOption: '' as unknown,
    colorPalette: undefined as unknown,
    textOverlay: undefined as unknown,
  } as Record<string, unknown>,
  input_image_url: 'input-url',
  status: 'completed',
  is_public: false,
  is_purchased: false,
};

const mockRevision1: PortraitRevision = {
  id: 'rev-1',
  portrait_id: 'original-id',
  user_id: 'user-1',
  parent_revision_id: 'original-id',
  customization_params: {
      ...mockOriginalPortrait.customization_params,
      artStyle: 'cartoon' 
    } as PortraitParameters, // Keep as PortraitParameters for hook input
  status: 'completed',
  image_versions: { processed_image_url: 'rev1-url' },
  feedback: null,
  created_at: '2023-01-01T11:00:00Z',
  updated_at: '2023-01-01T11:05:00Z',
  processing_error: null,
};

const mockRevision2: PortraitRevision = {
    id: 'rev-2',
    portrait_id: 'original-id',
    user_id: 'user-1',
    parent_revision_id: 'rev-1',
    customization_params: {
        ...mockRevision1.customization_params,
        background: 'nature' 
    } as PortraitParameters, // Keep as PortraitParameters for hook input
    status: 'completed',
    image_versions: { processed_image_url: 'rev2-url' },
    feedback: null,
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:05:00Z',
    processing_error: null,
};


describe('usePortraitRevisionHistory', () => {
  // Test case for initial history setup
  test('should initialize history with original and revisions', () => {
    const { result } = renderHook(() => usePortraitRevisionHistory());

    act(() => {
      result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1, mockRevision2]);
    });

    // Expect the latest revision to be the present, and others in past
    expect(result.current.present?.id).toBe('rev-2');
    expect(result.current.past.length).toBe(2);
    expect(result.current.past[0].id).toBe('original-id');
    expect(result.current.past[1].id).toBe('rev-1');
    expect(result.current.future.length).toBe(0);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  // Test case for adding a new version
  test('should add a new version and clear future', () => {
    const { result } = renderHook(() => usePortraitRevisionHistory());

    act(() => {
      result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1]);
    });

    const newVersion: GalleryPortrait = {
        ...mockRevision1,
        id: 'rev-3',
        parent_revision_id: 'rev-1',
        customization_params: { ...mockRevision1.customization_params, colorPalette: 'warm' } as Record<string, unknown>,
        created_at: '2023-01-01T13:00:00Z',
        image_versions: { processed_image_url: 'rev3-url' },
    };

    act(() => {
        result.current.addVersion(newVersion);
    });

    expect(result.current.present?.id).toBe('rev-3');
    expect(result.current.past.length).toBe(2);
    expect(result.current.past[1].id).toBe('rev-1'); // original and rev-1 should be in past
    expect(result.current.future.length).toBe(0); // Future should be cleared
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });


  // Test case for undo
  test('should undo to the previous version', () => {
    const { result } = renderHook(() => usePortraitRevisionHistory());

    act(() => {
        result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1, mockRevision2]);
    });

    act(() => {
        result.current.undo();
    });

    expect(result.current.present?.id).toBe('rev-1');
    expect(result.current.past.length).toBe(1);
    expect(result.current.past[0].id).toBe('original-id');
    expect(result.current.future.length).toBe(1);
    expect(result.current.future[0].id).toBe('rev-2');
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(true);

    act(() => {
        result.current.undo();
    });

    expect(result.current.present?.id).toBe('original-id');
    expect(result.current.past.length).toBe(0);
    expect(result.current.future.length).toBe(2);
    expect(result.current.future[0].id).toBe('rev-1');
    expect(result.current.future[1].id).toBe('rev-2');
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);

     // Attempt to undo when no more history
     act(() => {
        result.current.undo();
    });
     expect(result.current.present?.id).toBe('original-id'); // State should not change
     expect(result.current.past.length).toBe(0);
     expect(result.current.future.length).toBe(2);
     expect(result.current.canUndo).toBe(false);
     expect(result.current.canRedo).toBe(true);
  });


    // Test case for redo
    test('should redo to the next version', () => {
        const { result } = renderHook(() => usePortraitRevisionHistory());

        act(() => {
            result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1, mockRevision2]);
        });

        // Undo twice to get to original state with future history
        act(() => { result.current.undo(); });
        act(() => { result.current.undo(); });

        expect(result.current.present?.id).toBe('original-id');
        expect(result.current.future.length).toBe(2);

        act(() => {
            result.current.redo();
        });

        expect(result.current.present?.id).toBe('rev-1');
        expect(result.current.past.length).toBe(1);
        expect(result.current.past[0].id).toBe('original-id');
        expect(result.current.future.length).toBe(1);
        expect(result.current.future[0].id).toBe('rev-2');
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(true);

        act(() => {
            result.current.redo();
        });

        expect(result.current.present?.id).toBe('rev-2');
        expect(result.current.past.length).toBe(2);
        expect(result.current.past[0].id).toBe('original-id');
        expect(result.current.past[1].id).toBe('rev-1');
        expect(result.current.future.length).toBe(0);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);

         // Attempt to redo when no more future
         act(() => {
            result.current.redo();
        });
         expect(result.current.present?.id).toBe('rev-2'); // State should not change
         expect(result.current.past.length).toBe(2);
         expect(result.current.future.length).toBe(0);
         expect(result.current.canUndo).toBe(true);
         expect(result.current.canRedo).toBe(false);
    });


    // Test case for setting a specific version as present
    test('should set a specific version from past as present', () => {
        const { result } = renderHook(() => usePortraitRevisionHistory());

        act(() => {
            result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1, mockRevision2]);
        });
        // Current state: present = rev-2, past = [original, rev-1], future = []

        act(() => {
            result.current.setPresentVersion('original-id');
        });

        expect(result.current.present?.id).toBe('original-id');
        expect(result.current.past.length).toBe(0); // Original should be removed from past
        expect(result.current.future.length).toBe(2); // rev-1 and rev-2 should be in future
        expect(result.current.future[0].id).toBe('rev-1');
        expect(result.current.future[1].id).toBe('rev-2');
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(true);

        // Set rev-1 as present
        act(() => {
            result.current.setPresentVersion('rev-1');
        });
         expect(result.current.present?.id).toBe('rev-1');
         expect(result.current.past.length).toBe(1); // original should be in past
         expect(result.current.past[0].id).toBe('original-id');
         expect(result.current.future.length).toBe(1); // rev-2 should be in future
         expect(result.current.future[0].id).toBe('rev-2');
         expect(result.current.canUndo).toBe(true);
         expect(result.current.canRedo).toBe(true);
    });

     test('should set a specific version from future as present', () => {
         const { result } = renderHook(() => usePortraitRevisionHistory());

         act(() => {
             result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1]);
         });
          // Current state: present = rev-1, past = [original], future = []

         act(() => { result.current.undo(); });
         // After undo: present = original, past = [], future = [rev-1]

         expect(result.current.present?.id).toBe('original-id');
         expect(result.current.future.length).toBe(1);


         act(() => {
             result.current.setPresentVersion('rev-1');
         });

         expect(result.current.present?.id).toBe('rev-1');
         expect(result.current.past.length).toBe(1); // original should be in past
         expect(result.current.past[0].id).toBe('original-id');
         expect(result.current.future.length).toBe(0); // rev-1 should be removed from future
         expect(result.current.canUndo).toBe(true);
         expect(result.current.canRedo).toBe(false);
     });

    // Test case for branching history after undo
    test('should clear future when a new version is added after undo', () => {
        const { result } = renderHook(() => usePortraitRevisionHistory());

        act(() => {
            result.current.setInitialHistory(mockOriginalPortrait, [mockRevision1, mockRevision2]);
        });
         // Current state: present = rev-2, past = [original, rev-1], future = []

        act(() => { result.current.undo(); }); // present = rev-1, past = [original], future = [rev-2]
        act(() => { result.current.undo(); }); // present = original, past = [], future = [rev-1, rev-2]

        expect(result.current.present?.id).toBe('original-id');
        expect(result.current.future.length).toBe(2);

        const newVersion: GalleryPortrait = {
             ...mockOriginalPortrait,
             id: 'rev-branch-1',
             parent_revision_id: 'original-id',
             customization_params: { ...mockOriginalPortrait.customization_params, artStyle: 'watercolor' } as Record<string, unknown>,
             created_at: '2023-01-01T14:00:00Z',
             image_versions: { processed_image_url: 'rev-branch-1-url' },
        };

        act(() => {
            result.current.addVersion(newVersion);
        });

        expect(result.current.present?.id).toBe('rev-branch-1');
        expect(result.current.past.length).toBe(1);
        expect(result.current.past[0].id).toBe('original-id');
        expect(result.current.future.length).toBe(0);
        expect(result.current.canUndo).toBe(true);
        expect(result.current.canRedo).toBe(false);
    });


    // Test case for empty initial history
    test('should handle empty initial revisions', () => {
         const { result } = renderHook(() => usePortraitRevisionHistory());

         act(() => {
             result.current.setInitialHistory(mockOriginalPortrait, []);
         });

         expect(result.current.present?.id).toBe('original-id');
         expect(result.current.past.length).toBe(0);
         expect(result.current.future.length).toBe(0);
         expect(result.current.canUndo).toBe(false);
         expect(result.current.canRedo).toBe(false);
    });

     // Test case for setInitialHistory with undefined processed_image_url
     test('should filter out revisions with undefined processed_image_url during initial history setup', () => {
         const mockRevisionWithMissingImage: PortraitRevision = {
             ...mockRevision1,
             id: 'rev-missing-image',
             image_versions: { other_url: 'some-url' }, // Missing processed_image_url
             created_at: '2023-01-01T11:30:00Z', // Between original and rev-1
         };

         const { result } = renderHook(() => usePortraitRevisionHistory());

         act(() => {
             result.current.setInitialHistory(mockOriginalPortrait, [mockRevisionWithMissingImage, mockRevision1, mockRevision2]);
         });

         // rev-missing-image should be filtered out. History should be original, rev-1, rev-2
         expect(result.current.present?.id).toBe('rev-2');
         expect(result.current.past.length).toBe(2);
         expect(result.current.past[0].id).toBe('original-id');
         expect(result.current.past[1].id).toBe('rev-1');
         expect(result.current.future.length).toBe(0);
         expect(result.current.canUndo).toBe(true);
         expect(result.current.canRedo).toBe(false);
     });
}); 