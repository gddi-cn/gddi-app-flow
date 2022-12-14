import React, { useCallback, useMemo } from 'react'
import shallow from 'zustand/shallow'
import { useStore } from '../store/useStore'
import { ModLabelsValueType } from '../types'
import { RgbColor, HexColorInput } from 'react-colorful'
import produce from 'immer'
import { PopoverColorPicker, EditableText } from './../Components'
import { stringToHex, rgbToHex, hexToRgb } from './../helpers'

import './FilterLabelsDisplay.scss'

import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import DeleteIcon from '@mui/icons-material/Delete'
import ShuffleOnTwoToneIcon from '@mui/icons-material/ShuffleOnTwoTone'
import LinearProgress from '@mui/material/LinearProgress'

interface Data {
  labelKey: string
  checked: boolean
  label: string
  color: [number, number, number]
}

interface HeadCell {
  disablePadding: boolean
  id: keyof Data
  label: string
  numeric: boolean
}

interface EnhancedTableProps {
  numSelected: number
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void
  rowCount: number
  checkDisabled?: boolean
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { onSelectAllClick, numSelected, rowCount, checkDisabled } = props

  const { c } = useStore(
    (state) => ({
      c: state.dictionary.node.detection.dialog.label.columns
    }),
    shallow
  )

  const headCells: readonly HeadCell[] = React.useMemo(() => {
    return [
      {
        id: 'labelKey',
        numeric: false,
        disablePadding: true,
        label: c.label
      },
      {
        id: 'label',
        numeric: false,
        disablePadding: false,
        label: c.mapLabel
      },
      {
        id: 'color',
        numeric: false,
        disablePadding: false,
        label: c.displayColor
      }
    ]
  }, [c])

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            disabled={checkDisabled}
            inputProps={{
              'aria-label': 'select all labels'
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
          >
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  )
}

interface EnhancedTableToolbarProps {
  numSelected: number
  deleteDisabled?: boolean
  onDelete?: () => void
}

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { numSelected, deleteDisabled, onDelete } = props

  const { s } = useStore(
    (state) => ({
      s: state.dictionary.node.detection.dialog.label.selected
    }),
    shallow
  )

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete()
    }
  }, [onDelete])

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            )
        })
      }}
    >
      <Typography
        sx={{ flex: '1 1 100%' }}
        color="inherit"
        variant="subtitle1"
        component="div"
      >
        {s.replace('{NUM}', numSelected.toString())}
      </Typography>
      {numSelected > 0 && !deleteDisabled ? (
        <Tooltip title="Delete">
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : null}
    </Toolbar>
  )
}

export interface FilterLabelsDisplayProps {
  labels: ModLabelsValueType
  onLabelsChange?: (newLabels: ModLabelsValueType) => void
}

export const FilterLabelsDisplay = ({
  labels,
  onLabelsChange
}: FilterLabelsDisplayProps): JSX.Element => {
  const { propEditingDisabled } = useStore(
    (state) => ({
      propEditingDisabled: state.propEditingDisabled
    }),
    shallow
  )
  const isSelected = useCallback(
    (labelKey: string) => labels[labelKey].checked,
    [labels]
  )

  const numSelected = useMemo(
    () => Object.values(labels).filter((label) => label.checked).length,
    [labels]
  )

  const rows = useMemo(
    () =>
      Object.keys(labels).map(
        (labelKey) =>
          ({
            labelKey,
            ...labels[labelKey]
          } as Data)
      ),
    [labels]
  )

  const handleCheckboxClick = (
    event: React.MouseEvent<unknown>,
    labelKey: string
  ) => {
    const checked0 = labels[labelKey].checked
    const newLabels = produce(labels, (draft) => {
      draft[labelKey] = {
        ...labels[labelKey],
        checked: !checked0
      }
    })
    if (onLabelsChange) {
      onLabelsChange(newLabels)
    }
  }

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLabels = produce(labels, (draft) => {
      Object.values(draft).forEach((label) => {
        label.checked = event.target.checked
      })
    })
    if (onLabelsChange) {
      onLabelsChange(newLabels)
    }
  }

  const handleDeleteAllClick = () => {
    const newLabels = produce(labels, (draft) => {
      Object.values(draft).forEach((label) => {
        label.checked = false
      })
    })
    if (onLabelsChange) {
      onLabelsChange(newLabels)
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={numSelected}
          deleteDisabled={propEditingDisabled}
          onDelete={handleDeleteAllClick}
        />
        <TableContainer sx={{ overflow: 'unset' }}>
          <Table
            sx={{ minWidth: 460 }}
            stickyHeader
            aria-labelledby="tableTitle"
            size="small"
          >
            <EnhancedTableHead
              numSelected={numSelected}
              onSelectAllClick={handleSelectAllClick}
              rowCount={rows.length}
              checkDisabled={propEditingDisabled}
            />
            <TableBody>
              {rows.map((row, index) => {
                const isItemSelected = isSelected(row.labelKey)
                const labelId = `enhanced-table-checkbox-${index}`
                const rgbColor: RgbColor = {
                  r: row.color[0],
                  g: row.color[1],
                  b: row.color[2]
                }
                const hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b)
                const randomColorHex = stringToHex(row.label)
                const handleColorChange = (newColor: RgbColor) => {
                  const newLabels = produce(labels, (draft) => {
                    draft[row.labelKey] = {
                      ...labels[row.labelKey],
                      color: [newColor.r, newColor.g, newColor.b]
                    }
                  })
                  if (onLabelsChange) {
                    onLabelsChange(newLabels)
                  }
                }
                const handleHexChange = (newHex: string) => {
                  const newColor = hexToRgb(newHex)
                  if (onLabelsChange && newColor !== null) {
                    const newLabels = produce(labels, (draft) => {
                      draft[row.labelKey] = {
                        ...labels[row.labelKey],
                        color: [newColor.r, newColor.g, newColor.b]
                      }
                    })
                    onLabelsChange(newLabels)
                  }
                }
                const handleSetDefaultColor = () => {
                  const newColor = hexToRgb(randomColorHex)
                  if (onLabelsChange && newColor !== null) {
                    const newLabels = produce(labels, (draft) => {
                      draft[row.labelKey] = {
                        ...labels[row.labelKey],
                        color: [newColor.r, newColor.g, newColor.b]
                      }
                    })
                    onLabelsChange(newLabels)
                  }
                }
                const handleMapLabelChange = (newStr: string) => {
                  const newLabels = produce(labels, (draft) => {
                    draft[row.labelKey] = {
                      ...labels[row.labelKey],
                      label: newStr
                    }
                  })
                  if (onLabelsChange) {
                    onLabelsChange(newLabels)
                  }
                }

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={row.labelKey}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isItemSelected}
                        inputProps={{
                          'aria-labelledby': labelId
                        }}
                        disabled={propEditingDisabled}
                        onClick={(event) =>
                          handleCheckboxClick(event, row.labelKey)
                        }
                      />
                    </TableCell>
                    <TableCell
                      component="th"
                      id={`${labelId}-labelKey`}
                      scope="row"
                      padding="none"
                      sx={{ maxWidth: '110px', overflowWrap: 'anywhere' }}
                    >
                      {row.labelKey}
                    </TableCell>
                    <TableCell
                      id={`${labelId}-mapLabel`}
                      align="left"
                      sx={{ maxWidth: '280px', overflowWrap: 'anywhere' }}
                    >
                      <EditableText
                        disabled={propEditingDisabled}
                        className="filterlabels-tr-maplabels"
                        value={row.label}
                        onChange={handleMapLabelChange}
                      />
                    </TableCell>
                    <TableCell id={`${labelId}-color`} align="left">
                      <Box className="tablecell-color">
                        <PopoverColorPicker
                          disabled={propEditingDisabled}
                          color={rgbColor}
                          onChange={handleColorChange}
                        />
                        <HexColorInput
                          className="hex-color-input"
                          disabled={propEditingDisabled}
                          color={hexColor}
                          onChange={handleHexChange}
                        />
                        <IconButton
                          aria-label="default-color"
                          size="small"
                          disabled={propEditingDisabled}
                          onClick={handleSetDefaultColor}
                          sx={{ padding: '0px', marginLeft: '0.4rem' }}
                        >
                          <ShuffleOnTwoToneIcon
                            color="primary"
                            fontSize="inherit"
                          />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}
