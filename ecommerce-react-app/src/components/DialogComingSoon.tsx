import {
  Dialog, DialogTitle, DialogContent, Typography, DialogActions, Button,
} from '@mui/material';

export const DialogComingSoon = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
  >
    <DialogTitle>Feature Not Implemented</DialogTitle>
    <DialogContent>
      <Typography>
        Feature Coming Soon...
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default DialogComingSoon;
