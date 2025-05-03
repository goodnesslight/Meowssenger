type User = {
  pendingInviteFrom: string | null;
  inChatWith: string | null;
};

const users: Map<string, User> = new Map();

export const createUser = (): string => {
  const id = crypto.randomUUID().slice(0, 8);
  users.set(id, {
    pendingInviteFrom: null,
    inChatWith: null,
  });
  return id;
};

export const sendInvite = (fromId: string, toId: string): boolean => {
  const from = users.get(fromId);
  const to = users.get(toId);
  if (!to || to.pendingInviteFrom || to.inChatWith) return false;
  to.pendingInviteFrom = fromId;
  return true;
};

export const acceptInvite = (myId: string): string | null => {
  const me = users.get(myId);
  if (!me || !me.pendingInviteFrom) return null;

  const senderId = me.pendingInviteFrom;
  const sender = users.get(senderId);
  if (!sender) return null;

  me.inChatWith = senderId;
  sender.inChatWith = myId;
  me.pendingInviteFrom = null;

  return senderId;
};

export const rejectInvite = (myId: string): void => {
  const me = users.get(myId);
  if (me) me.pendingInviteFrom = null;
};

export const leaveChat = (id: string): void => {
  const me = users.get(id);
  if (me?.inChatWith) {
    const partner = users.get(me.inChatWith);
    if (partner) partner.inChatWith = null;
  }
  if (me) me.inChatWith = null;
};

export const getUser = (id: string): User | undefined => {
  return users.get(id);
};
