import {
  AlertDialog as AlertDialogComponent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

type AlertDialogProps = React.PropsWithChildren<{
  title: string;
  description: string;
  onConfirm: () => void;
}>;

/**
 *
 * @param {AlertDialogProps['title']} title The wording for the dialog heading.
 * @param {AlertDialogProps['description']} description Additional descriptive text for the dialog.
 * @returns
 */
export function AlertDialog({
  children,
  title,
  description,
  onConfirm,
}: AlertDialogProps) {
  return (
    <AlertDialogComponent>
      {children}
      <AlertDialogContent onCloseAutoFocus={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogComponent>
  );
}

export { AlertDialogTrigger } from './ui/alert-dialog';
