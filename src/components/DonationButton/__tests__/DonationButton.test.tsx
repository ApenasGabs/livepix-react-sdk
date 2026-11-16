import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import DonationButton from "../DonationButton";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("DonationButton Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = "https://app.example.com/donate";
  });

  it("submits donation via BFF without exposing clientSecret", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        redirectUrl: "https://livepix.gg/checkout/donation-1",
        reference: "ref_donation_1",
      },
    });

    render(<DonationButton paymentEndpoint="/api/livepix/payments" />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /Doar com Pix/i })
      );
    });

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/livepix/payments", {
      amount: 1000,
      currency: "BRL",
      redirectUrl: "https://app.example.com/donate",
    });
    expect(window.location.href).toBe(
      "https://livepix.gg/checkout/donation-1"
    );
  });

  it("shows error and avoids redirecting on unsafe BFF URL", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        redirectUrl: "javascript:alert(1)",
        reference: "ref_bad",
      },
    });

    render(<DonationButton paymentEndpoint="/api/livepix/payments" />);

    await act(async () => {
      await userEvent.click(
        screen.getByRole("button", { name: /Doar com Pix/i })
      );
    });

    expect(window.location.href).toBe("https://app.example.com/donate");
    expect(
      screen.getByText(/Falha ao processar doação/i)
    ).toBeInTheDocument();

    errorSpy.mockRestore();
  });
});
