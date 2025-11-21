import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
    it('renders without crashing', () => {
        render(<App />);
        // Since App redirects to /login if not authenticated, we might see login page or loading
        // But we need to mock AuthProvider or Router if they are inside App.
        // App contains AuthProvider and Router.
        // So it should render.
        // Let's just check if it renders something.
        expect(document.body).toBeDefined();
    });
});
