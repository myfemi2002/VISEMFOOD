type WhatsAppMessageInput = {
  phoneNumber: string;
  template: string;
  name: string;
  price?: string | number | null;
};

export function compileTemplate(template: string, data: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => data[key] ?? "");
}

export function buildWhatsAppUrl({ phoneNumber, template, name, price }: WhatsAppMessageInput) {
  const message = compileTemplate(template, {
    name,
    price: price ? `${price}` : "",
    quantity_prompt: "Please let me know the quantity and delivery arrangement."
  });

  return `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
