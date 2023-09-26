import {
  AlertDialog as AlertDialogComponent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';

type AlertDialogProps = React.PropsWithChildren<{
  title: string;
  description: string;
  onConfirm: () => void;
}>;

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
