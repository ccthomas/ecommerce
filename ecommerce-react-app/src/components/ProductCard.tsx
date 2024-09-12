import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import routeConfigs from '../RoutesConfig';

export type ProductCardProps = {
  id: string,
  title: string;
  imageUrl: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
  onDeleteClick?: () => void;
};

export default function ProductCard({
  id,
  title,
  imageUrl,
  canEdit = false,
  canDelete = false,
  onDeleteClick = () => { },
}: ProductCardProps) {
  const navigate = useNavigate();
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={imageUrl === null ? undefined : imageUrl}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {title}
          </Typography>
        </CardContent>
      </CardActionArea>
      <CardActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>
          From $XXX.YY
        </Typography>
        <Box>
          {canEdit && (
            <IconButton aria-label="delete" size="small" onClick={() => {
              navigate(`${routeConfigs.productsEdit.path}?id=${id}`);
            }}>
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          {(canDelete) && (
            <IconButton aria-label="delete" size="small" onClick={onDeleteClick}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardActions>
    </Card>
  );
}
