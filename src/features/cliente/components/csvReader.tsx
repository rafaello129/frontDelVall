import { Close } from '@mui/icons-material';
import { Button, Dialog, DialogTitle, IconButton } from '@mui/material';
import React from 'react';
import { usePapaParse } from 'react-papaparse';



const CsvReader: React.FC = () => {
    const { readString } = usePapaParse();
    const [isViewOpen, setIsViewOpen] = React.useState(false);
    const handleCloseView = () => {
        setIsViewOpen(false);
    };
    const csvString = 
    `Column 1,Column 2,Column 3,Column 4
     1-1,1-2,1-3,1-4
     2-1,2-2,2-3,2-4
     3-1,3-2,3-3,3-4
     4,5,6,7`;
     const handleCsv = () => {
       readString(csvString, {
         worker: true,
         complete: (_results) => {
          }
         });
     }
    return (
        <>

        <Dialog
          open={isViewOpen}
          onClose={handleCloseView}
        fullWidth
        maxWidth="sm"
      >
    <DialogTitle sx={{ display: 'flex', justifyContent: 'right', alignItems: 'flex-end' }}>
     
        <IconButton size="small" onClick={handleCloseView} aria-label="close">
            <Close />
        </IconButton>
    </DialogTitle>
        <Button
          variant="contained"
          color="primary"
          onClick={handleCsv}
          sx={{ margin: 2 }}
        >
          Leer CSV
        </Button>
        <p>Revisa la consola para ver los resultados del CSV leído.</p>

      </Dialog>
      
      </>
    );
};

export default CsvReader;