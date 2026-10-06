import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders the weather search interface', () => {
  render(<App />);
  expect(screen.getByText(/what's the weather like/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /get weather/i })).toBeInTheDocument();
});

test('displays API temperatures as Celsius', async () => {
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: 31.72, lon: 72.98 }],
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Chiniot',
        sys: { country: 'PK' },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        main: { temp: 33, feels_like: 32 },
        wind: { speed: 3.13 },
      }),
    });

  render(<App />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Chiniot' } });
  fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

  await waitFor(() => {
    expect(screen.getByText('33°C')).toBeInTheDocument();
    expect(screen.getByText('32°C')).toBeInTheDocument();
  });

  expect(global.fetch).toHaveBeenLastCalledWith(
    expect.stringContaining('&units=metric'),
  );
});

test('shows a loading state while weather is being fetched', async () => {
  let resolveWeather;
  global.fetch = jest.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => [{ lat: 31.72, lon: 72.98 }],
    })
    .mockImplementationOnce(() => new Promise((resolve) => {
      resolveWeather = resolve;
    }));

  render(<App />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Chiniot' } });
  fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

  expect(screen.getByRole('button', { name: /loading weather/i })).toBeDisabled();
  await waitFor(() => {
    expect(resolveWeather).toEqual(expect.any(Function));
  });
  resolveWeather({
    ok: true,
    json: async () => ({
      name: 'Chiniot',
      sys: { country: 'PK' },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: { temp: 33, feels_like: 32 },
      wind: { speed: 3.13 },
    }),
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /get weather/i })).toBeEnabled();
  });
});

test('shows an error when the city cannot be found', async () => {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    json: async () => [],
  });

  render(<App />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NotARealCity' } });
  fireEvent.click(screen.getByRole('button', { name: /get weather/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(
    /couldn't find "NotARealCity"/i,
  );
});
