import { getGroupById } from 'server/group/group-db';
import { getUserBangers } from 'server/bangers/bangers-db';

/**
 * 1: Song with the most users
 * 2: Song with 2 or more, but not top
 * 3: Song with ONLY 1 user
 */
export async function getSpecialSongInGroup(
  groupId: string,
  // eslint-disable-next-line no-unused-vars
  type: '1' | '2' | '3',
) {
  const group = await getGroupById(groupId);

  const bangs = await getUserBangers(group!.users[0].userId);

  /*
    TODO:

    When solo bangers (3), first pick a random person, then pick a random song from their bangers that is unique to them
    When multiple bangers(1), get the top 10 songs, look at distribution of users, pick the song that fits the type
    When normal(2), TODO
   */
  return bangs[0][1];
}
