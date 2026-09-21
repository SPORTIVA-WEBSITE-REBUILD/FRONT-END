/** The firm's public phone numbers, in order, skipping any that are blank. */
export function phonesOf(contact = {}) {
  return [contact.phone, contact.phone2].filter(Boolean);
}

/** A tel: link target: digits and a leading plus only. */
export const telHref = (number) => `tel:${number.replace(/[^\d+]/g, '')}`;
