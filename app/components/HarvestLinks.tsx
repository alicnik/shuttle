import * as React from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useToast,
} from './ui';
import { Tooltip } from './Tooltip';
import { Link2Icon } from '@radix-ui/react-icons';
import { LINK_COPY_SUCCESS_MESSAGE } from '~/lib';
import type { Email } from '@prisma/client';
import { AccessibleIcon } from './AccessibleIcon';

interface HarvestLinksProps {
  email: Email;
}

export function HarvestLinks({ email }: HarvestLinksProps) {
  const { toast } = useToast();

  const links = React.useMemo(() => {
    /* c8 ignore next 3 */
    if (typeof window === 'undefined') {
      return [];
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(email.html, 'text/html');
    const links = Array.from(doc.querySelectorAll('a'));
    const mapped = links.map((link) => {
      const linkDoc = parser.parseFromString(link.innerHTML, 'text/html');
      const elements = linkDoc.querySelectorAll('*');
      elements.forEach((element) => {
        element.removeAttribute('style');
        element.removeAttribute('width');
        element.removeAttribute('height');
        if (element.tagName === 'IMG') {
          element.setAttribute('style', 'max-width: 80%;');
        }
      });
      link.innerHTML = linkDoc.body.innerHTML;
      return link;
    });
    return mapped;
  }, [email.html]);

  return (
    <Dialog>
      <Tooltip content="Harvest links">
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-zinc-300"
            type="button"
            size="icon"
          >
            <AccessibleIcon label="Harvest links from email">
              <Link2Icon />
            </AccessibleIcon>
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Found the following links in the email</DialogTitle>
          <DialogDescription>
            Click a link to copy it to your clipboard
          </DialogDescription>
          {links.length > 0 ? (
            <ul className="grid auto-rows-fr grid-cols-2 place-items-center gap-x-2 gap-y-8 pt-8">
              {links.map((link) => {
                return (
                  <Tooltip key={link.href} content={link.href} sideOffset={4}>
                    <li
                      className="flex cursor-pointer justify-center"
                      dangerouslySetInnerHTML={{
                        __html: link.innerHTML,
                      }}
                      onClick={async () => {
                        await navigator.clipboard.writeText(link.href);
                        toast({
                          description: LINK_COPY_SUCCESS_MESSAGE,
                        });
                      }}
                    />
                  </Tooltip>
                );
              })}
            </ul>
          ) : (
            <DialogDescription>
              No links were found in the email
            </DialogDescription>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
