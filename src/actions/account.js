export const SAVE_ACCOUNT = 'SAVE_ACCOUNT';

export function saveAccount(account) {
  return { type: SAVE_ACCOUNT, account };
}
