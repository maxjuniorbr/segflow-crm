import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { ConfirmDialog } from './ConfirmDialog';

describe('ConfirmDialog accessibility', () => {
    it('open dialog has no a11y violations', async () => {
        const { container } = render(
            <ConfirmDialog
                isOpen={true}
                title="Confirm action"
                message="Are you sure?"
                onConfirm={() => {}}
                onCancel={() => {}}
            />
        );
        const results = await axe(container);
        expect(results.violations).toEqual([]);
    });
});
