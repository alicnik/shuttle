import type { Email } from '@prisma/client';
import { Checkbox } from '~/components/ui/checkbox';
import { useNavigation, useSubmit } from '@remix-run/react';
import { formatRelative } from 'date-fns';

interface EmailCardProps {
  email: Email;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  preview: string | null;
  setPreview: React.Dispatch<React.SetStateAction<string | null>>;
}

export function EmailCard({
  email,
  selected,
  setSelected,
  preview,
  setPreview,
}: EmailCardProps) {
  const submit = useSubmit();
  const navigation = useNavigation();

  if (navigation.state === 'submitting') {
    console.log(Object.fromEntries(navigation.formData || []));
  }

  const isOptimisticRead =
    ['submitting', 'loading'].includes(navigation.state) &&
    navigation.formData?.get('_action') === 'markRead' &&
    navigation.formData?.get('emailId') === email.id;

  const isOptimisticUnread =
    ['submitting', 'loading'].includes(navigation.state) &&
    navigation.formData?.get('_action') === 'markSelectedUnread' &&
    String(navigation.formData?.get('selected')).split(',').includes(email.id);

  const isSelected = selected.includes(email.id);
  const isPreview = preview === email.id;

  const from = email.from.startsWith('<')
    ? email.from.slice(1, -1)
    : email.from.split('<')[0].trim();

  return (
    <div
      data-selected={isSelected}
      data-in-view={isPreview}
      className="mb-4 flex gap-2 rounded-md p-2 hover:bg-zinc-800 data-[in-view=true]:bg-zinc-800 data-[selected=true]:bg-zinc-800"
    >
      <Checkbox
        className="mt-[2px]"
        checked={isSelected || isPreview}
        onCheckedChange={(checked) => {
          setSelected((selected) => {
            if (checked) {
              return [...selected, email.id];
            }

            if (isPreview) {
              setPreview(null);
            }
            return selected.filter((id) => id !== email.id);
          });
        }}
      />
      <div
        data-read={!isOptimisticUnread && (email.read || isOptimisticRead)}
        className="cursor-pointer text-left data-[read=true]:opacity-50"
        onClick={() =>
          setPreview((current) => {
            if (current) {
              submit(
                { emailId: current, _action: 'markRead' },
                { method: 'post' }
              );
            }
            return email.id;
          })
        }
      >
        <div className="mb-1 flex items-center ">
          <p className="mr-12 w-max text-sm font-bold">{from}</p>
          <p className="ml-auto w-max text-xs">
            {formatRelative(email.createdAt, new Date())}
          </p>
        </div>
        <p className="mb-1 text-sm">{email.subject}</p>
        <p className="line-clamp-2 text-xs">{email.text}</p>
      </div>
    </div>
  );
}
