import * as R from 'remeda';
import React, { ReactElement, Suspense } from 'react';
import Link from 'next/link';
import { Crosshair2Icon, GearIcon, HeartFilledIcon, StarFilledIcon } from '@radix-ui/react-icons';
import { MessageCircleWarningIcon } from 'lucide-react';
import { notFound } from 'next/navigation';

import { getUser } from 'server/user/user-service';
import { getGroupById } from 'server/group/group-db';
import { getGroupBangers } from 'server/bangers/bangers-db';

import { FullPage, FullPageDescription } from '@/components/layout/Layouts';
import { TrackGrid } from '@/components/track/TrackGrid';
import Track, { LazyTrack, TrackSkeleton } from '@/components/track/Track';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import GroupAvatar from '@/components/avatar/GroupAvatar';

type Props = {
  params: {
    id: string;
  };
};

function Page({ params: { id } }: Props): ReactElement {
  return (
    <FullPage
      title="Group bangers"
      back={{
        to: '/groups',
        text: 'Back to groups',
      }}
      actions={
        <Button variant="outline" asChild>
          <Link href={`/groups/${id}/details`}>
            <GearIcon className="h-4 w-4 mr-2" />
            Group details
          </Link>
        </Button>
      }
    >
      <Suspense>
        <GroupBangers id={id} />
      </Suspense>
    </FullPage>
  );
}

async function GroupBangers({ id }: { id: string }) {
  const [group, bangers, user] = await Promise.all([getGroupById(id), getGroupBangers(id), getUser()]);

  if (!user) {
    notFound();
  }

  if (group == null || group.users.find((u) => u.userId === user?.userId) == null) {
    notFound();
  }

  const biggestBangerCount = R.firstBy(bangers, [(banger) => banger.userCount, 'desc'])?.userCount ?? 0;

  return (
    <div>
      <FullPageDescription className="flex gap-3 mb-3 justify-between items-center">
        <div className="flex gap-3 items-center">
          <GroupAvatar iconIndex={group.iconIndex} />
          <h1 className="text-lg">
            {bangers.length} certified bangers for {group.name}
          </h1>
        </div>
        <Button variant="outline" className="mr-3 rounded-full w-10 h-10" asChild>
          <Link href={`/groups/${id}/wheel`} aria-label="Go to The Wheel" className="relative">
            <Crosshair2Icon className="h-4 w-4 absolute" />
            <Crosshair2Icon className="h-4 w-4 animate-ping absolute" />
          </Link>
        </Button>
      </FullPageDescription>

      {bangers.length === 0 && (
        <Alert className="mt-4">
          <MessageCircleWarningIcon className="h-4 w-4" />
          <AlertTitle>No bangers found?!</AlertTitle>
          <AlertDescription>
            Invite your friends, have them add their karaoke bangers! There has got to be at least one song you all
            share. :-)
          </AlertDescription>
        </Alert>
      )}

      {bangers.length > 0 && (
        <TrackGrid>
          {bangers.map((banger) => (
            <div key={banger.songId} className="relative">
              <div className="text-xs ml-1 mb-0.5 truncate">{banger.users.join(', ')}</div>
              {banger.track != null ? (
                <Track track={banger.track} action="none" />
              ) : (
                <Suspense fallback={<TrackSkeleton />}>
                  <LazyTrack trackId={banger.songId} action="none" />
                </Suspense>
              )}
              <div className="absolute right-0 top-5 xs:top-6 xs:left-2 rounded-full w-6 h-6 flex items-center justify-center m-2">
                {banger.userCount === biggestBangerCount && biggestBangerCount > 2 ? (
                  <>
                    <StarFilledIcon className="h-10 w-10 text-yellow-500 absolute" />
                    <StarFilledIcon className="h-10 w-10 text-yellow-400 absolute animate-ping" />
                  </>
                ) : (
                  <div className="border min-w-7 min-h-7 bg-green-800/80 rounded-full" />
                )}
                <div className={"absolute text-white font-bold"}>{banger.userCount}</div>
              </div>
            </div>
          ))}
        </TrackGrid>
      )}
    </div>
  );
}

export default Page;
