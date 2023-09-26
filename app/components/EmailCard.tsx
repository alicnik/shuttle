import type { Email } from '@prisma/client';
import { Checkbox } from '~/components/ui/checkbox';
import { Form, useNavigation, useSearchParams } from '@remix-run/react';
import { formatRelative } from 'date-fns';

interface EmailCardProps {
  email: Email;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}

export function EmailCard({ email, selected, setSelected }: EmailCardProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();

  const isOptimisticRead =
    ['submitting', 'loading'].includes(navigation.state) &&
    navigation.formData?.get('_action') === 'markRead' &&
    navigation.formData?.get('emailId') === email.id;

  const isOptimisticUnread =
    ['submitting', 'loading'].includes(navigation.state) &&
    navigation.formData?.get('_action') === 'markSelectedUnread' &&
    String(navigation.formData?.get('selected')).split(',').includes(email.id);

  const isSelected = selected.includes(email.id);
  const isPreview = searchParams.get('preview') === email.id;

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
        checked={isSelected}
        onCheckedChange={(checked) => {
          setSelected((selected) => {
            if (checked) {
              return [...selected, email.id];
            }
            if (isPreview) {
              setSearchParams((params) => {
                params.set('preview', selected[0]);
                return params;
              });
            }
            return selected.filter((id) => id !== email.id);
          });
        }}
      />
      <Form method="post" className="w-full">
        <input type="hidden" name="emailId" value={email.id} />
        <button
          type="submit"
          name="_action"
          value="setPreview"
          data-read={!isOptimisticUnread && (email.read || isOptimisticRead)}
          className="w-full cursor-pointer text-left data-[read=true]:opacity-50"
          onClick={() => {
            console.log('click');
            setSelected([]);
          }}
        >
          <div className="mb-1 flex items-center ">
            <p className="mr-12 w-max text-sm font-bold">{from}</p>
            <p className="ml-auto w-max text-xs">
              {formatRelative(email.createdAt, new Date())}
            </p>
          </div>
          <p className="mb-1 max-w-[250px] truncate text-sm">{email.subject}</p>
          <p className="line-clamp-2 max-w-[300px] text-xs">{email.text}</p>
        </button>
      </Form>
    </div>
  );
}
