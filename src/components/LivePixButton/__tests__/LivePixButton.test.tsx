import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import LivePixButton from "../index";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("LivePixButton (Dual Server/Client Security Architecture)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = "https://app.example.com/donate";
  });

  it("renders correctly with default props", () => {
    render(<LivePixButton />);
    expect(screen.getByRole("button")).toHaveTextContent("Doar");
  });

  it("shows warning when neither BFF endpoint nor public link is configured", () => {
    render(<LivePixButton />);
    expect(
      screen.getByText(/credenciais da api não configuradas/i)
    ).toBeInTheDocument();
  });

  it("shows custom label when provided", () => {
    render(<LivePixButton label="Doar R$ 5,00" username="apenasgabs" />);
    expect(screen.getByRole("button")).toHaveTextContent("Doar R$ 5,00");
  });

  it("becomes disabled when disabled prop is true", () => {
    render(<LivePixButton disabled username="apenasgabs" />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick callback when provided", async () => {
    const mockOnClick = jest.fn();
    render(<LivePixButton onClick={mockOnClick} />);

    await userEvent.click(screen.getByRole("button"));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it("redirects via BFF paymentEndpoint without requiring clientSecret in browser", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          redirectUrl: "https://livepix.gg/checkout/bff-payment-123",
          reference: "ref_123",
        },
      },
    });

    render(
      <LivePixButton
        paymentEndpoint="/api/livepix/payments"
        amount={1500}
        currency="BRL"
        redirectUrl="https://example.com/thanks"
      />
    );

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/livepix/payments", {
      amount: 1500,
      currency: "BRL",
      redirectUrl: "https://example.com/thanks",
    });
    expect(window.location.href).toBe(
      "https://livepix.gg/checkout/bff-payment-123"
    );
  });

  it("redirects via BFF proxyUrl appending /payments", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        redirectUrl: "https://livepix.gg/checkout/proxy-456",
        reference: "ref_456",
      },
    });

    render(<LivePixButton proxyUrl="/api/livepix" amount={2000} />);

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/livepix/payments", {
      amount: 2000,
      currency: "BRL",
      redirectUrl: "https://app.example.com/donate",
    });
    expect(window.location.href).toBe("https://livepix.gg/checkout/proxy-456");
  });

  it("redirects to public creator page when username is provided", async () => {
    render(<LivePixButton username="@apenasgabs" />);

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });

    expect(window.location.href).toBe("https://livepix.gg/apenasgabs");
  });

  it("emits security warning and blocks execution when clientSecret is passed in browser", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <LivePixButton
        clientId="exposed-id"
        clientSecret="exposed-secret"
        redirectUrl="https://example.com/return"
      />
    );

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[LivePix Security Warning]")
    );

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });

    expect(
      screen.getByText(/clientSecret não é permitido no navegador/i)
    ).toBeInTheDocument();

    warnSpy.mockRestore();
  });

  it("blocks redirect when BFF returns non-HTTP(S) redirectUrl", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        redirectUrl: "javascript:alert(document.cookie)",
        reference: "ref_unsafe",
      },
    });

    render(<LivePixButton paymentEndpoint="/api/livepix/payments" />);

    await act(async () => {
      await userEvent.click(screen.getByRole("button"));
    });

    expect(window.location.href).toBe("https://app.example.com/donate");
    expect(
      screen.getByText(/protocolo de url de redirecionamento não permitido/i)
    ).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
