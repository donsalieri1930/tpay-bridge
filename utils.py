def _mask_text(text: str, mask_char='*') -> str:
    """
    Replace the whole text with mask_char leaving only the first and last characters.
    """
    if len(text) < 2: return text
    return text[0] + mask_char * (len(text) - 2) + text[-1]


def mask_last_word(text: str, mask_char='*') -> str:
    """
    Censor the last word by replacing with mask character.
    """
    words = text.split()
    if not words: return text
    words[-1] = _mask_text(words[-1], mask_char)
    return ' '.join(words)


def mask_first_word(text: str, mask_char='*') -> str:
    """
    Censor the first word by replacing with mask character.
    """
    return mask_last_word(text[::-1], mask_char)[::-1]


def mask_email(email: str, mask_char='*') -> str:
    """
    Replace email username with mask_char leaving only the first and last characters.
    """
    parts = email.split('@')
    if not parts: return email
    parts[0] = _mask_text(parts[0], mask_char)
    return '@'.join(parts)
