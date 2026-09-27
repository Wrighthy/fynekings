export interface BankConfig {
  bankName: string;
  accountName: string;
  accountNumber: string;
  currency: string;
  branch: string;
  sortCode?: string;
  conciergeWhatsApp: string;
  conciergeEmail: string;
  paymentWindowHours: number;
  instructions: string[];
}

export const FYNEKINGS_BANK_DETAILS: BankConfig = {
  bankName: "Sterling Bank",
  accountName: "FYNEKINGS INTERNATIONAL LIMITED",
  accountNumber: "0068308622",
  currency: "NGN",
  branch: "Victoria Island, Lagos",
  conciergeWhatsApp: "2348033376287",
  conciergeEmail: process.env.CONTACT_EMAIL || "concierge@fynekings.com",
  paymentWindowHours: 24,
  instructions: [
    "Transfer the exact acquisition total to the official corporate account above.",
    "Include your Order Reference in the bank payment narration / remark.",
    "Your timepiece reservation will be held securely for 24 hours.",
    "Send proof of transfer to our concierge via WhatsApp or email for immediate clearance."
  ],
};
