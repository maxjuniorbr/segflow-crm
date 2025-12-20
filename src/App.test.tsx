import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./services/api', () => ({
    api: {
        get: vi.fn().mockResolvedValue(null)
    }
}));

describe('App', () => {
    it('renders without crashing', async () => {
        render(<App />);
        expect(await screen.findByText('Acesse sua conta')).toBeInTheDocument();
    });
});
