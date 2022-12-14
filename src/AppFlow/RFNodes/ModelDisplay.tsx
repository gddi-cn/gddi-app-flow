import React, { useMemo, useCallback, useState, useEffect } from 'react'
import shallow from 'zustand/shallow'
import { useStore } from '../store/useStore'
import { ModelRes } from '../types'
import { ModelSelectSearch } from './ModelSelectSearch'
import { ModelListItemContent } from './ModelListItemContent'

import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import EditIcon from '@mui/icons-material/Edit'
import { ModelValueType } from './ModelConfigTool'
import { Divider } from '@mui/material'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}))

export interface ModelDisplayProps {
  model: ModelValueType
  onModelChange?: (newModel: ModelValueType) => void
}

export const ModelDisplay = ({
  model,
  onModelChange
}: ModelDisplayProps): JSX.Element => {
  const { propEditingDisabled, modelListFetcher, m } = useStore(
    (state) => ({
      propEditingDisabled: state.propEditingDisabled,
      modelListFetcher: state.modelListFetcher,
      m: state.dictionary.node.detection.dialog.model.modelSelect
    }),
    shallow
  )
  const [openD, setOpenD] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<ModelRes | undefined>(
    model
  )
  const [page, setPage] = useState(1)

  const handleClickEdit = useCallback(() => {
    setOpenD(true)
  }, [setOpenD])

  const handleCloseD = useCallback(() => {
    setOpenD(false)
  }, [])

  const handleConfirmSelect = useCallback(() => {
    setOpenD(false)
    if (onModelChange) {
      onModelChange(selectedModel)
    }
  }, [selectedModel, onModelChange])

  const handleSelectChange = useCallback((val: ModelRes) => {
    setSelectedModel(val)
  }, [])

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
    },
    [setPage]
  )

  // disable model change when
  // propEditingDisabled set OR fetchers needed are not defined
  const disableEdit = useMemo(
    () => propEditingDisabled || modelListFetcher === undefined,
    [propEditingDisabled, modelListFetcher]
  )

  useEffect(() => {
    setSelectedModel(model)
  }, [model])

  return (
    <Box>
      <ListItem
        secondaryAction={
          disableEdit ? null : (
            <IconButton edge="end" aria-label="edit" onClick={handleClickEdit}>
              <EditIcon />
            </IconButton>
          )
        }
      >
        <ModelListItemContent modelInfo={model} />
      </ListItem>
      <BootstrapDialog
        onClose={handleCloseD}
        aria-labelledby="customized-dialog-title"
        open={openD}
        maxWidth={'sm'}
        fullWidth
      >
        <ModelSelectSearch
          page={page}
          selected={selectedModel}
          onSelect={handleSelectChange}
          onPageChange={handlePageChange}
        />
        <Divider />
        <DialogActions>
          <Button color="inherit" onClick={handleCloseD}>
            {m.cancel}
          </Button>
          <Button onClick={handleConfirmSelect}>{m.confirm}</Button>
        </DialogActions>
      </BootstrapDialog>
    </Box>
  )
}
