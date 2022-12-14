import React, { useMemo, useCallback, useState, useContext } from 'react'
import shallow from 'zustand/shallow'
import { useStore, pageSize } from '../store/useStore'
import { ModelRes } from '../types'
import { SearchBar } from './../Components'
import { debounce } from 'lodash'
import { QueryModelContext } from './NodeContext'
import { ModelListItemContent } from './ModelListItemContent'
import './ModelSelectSearch.scss'

import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import Pagination from '@mui/material/Pagination'
import LinearProgress from '@mui/material/LinearProgress'
import { DialogContent, DialogTitle } from '@mui/material'

export interface ModelSelectSearchProps {
  page: number
  selected: ModelRes | undefined
  onSelect: (val: ModelRes) => void
  onPageChange: (newPage: number) => void
}

export const ModelSelectSearch = ({
  page,
  selected,
  onSelect,
  onPageChange
}: ModelSelectSearchProps): JSX.Element => {
  const { queryModelType } = useContext(QueryModelContext)
  const {
    fetchLoading,
    fetchModelRes,
    searchModelRes,
    fetchModelsWithLabels,
    setFetchLoading,
    m
  } = useStore(
    (state) => ({
      fetchLoading: state.fetchLoading,
      fetchModelRes: state.fetchModelRes,
      searchModelRes: state.searchModelRes,
      fetchModelsWithLabels: state.fetchModelsWithLabels,
      setFetchLoading: state.setFetchLoading,
      m: state.dictionary.node.detection.dialog.model.modelSelect
    }),
    shallow
  )
  const [searchPageNum, setSearchPageNum] = useState<number>(1)
  const [showSearchResult, setShowSearchResult] = useState<boolean>(false)

  const handlePageChange = useCallback(
    (evt, pageNum) => {
      // setPage(pageNum)
      onPageChange(pageNum)
      setFetchLoading(true)
      fetchModelsWithLabels(pageNum, undefined, queryModelType)
    },
    [fetchModelsWithLabels, setFetchLoading, onPageChange, queryModelType]
  )

  const debouncedHandlePageChange = useMemo(
    () => debounce(handlePageChange, 300),
    [handlePageChange]
  )

  const handleReqSearch = useCallback(
    (searchVal) => {
      // console.log(`req search on value - ${searchVal}`)
      setShowSearchResult(true)
      setSearchPageNum(1)
      setFetchLoading(true)
      fetchModelsWithLabels(1, searchVal, queryModelType)
    },
    [
      setShowSearchResult,
      fetchModelsWithLabels,
      setFetchLoading,
      queryModelType
    ]
  )

  const handleCancelSearch = () => {
    setFetchLoading(false)
    setShowSearchResult(false)
  }

  const dispModels = useMemo(
    () => (showSearchResult ? searchModelRes : fetchModelRes),
    [showSearchResult, fetchModelRes, searchModelRes]
  )

  const LoadingElem = useMemo(
    () => (
      <Box sx={{ width: '100%', flex: 1, minHeight: 200 }}>
        <LinearProgress sx={{ top: '50%' }} />
      </Box>
    ),
    []
  )

  const ModelListElem = useMemo(
    () => (
      <Box className="list-with-page">
        <Box className="list-area">
          <List dense={true}>
            {dispModels.models.map((modInfo) => {
              const handleClick = () => {
                onSelect(modInfo)
              }
              return (
                <ListItemButton
                  key={`${modInfo.mod_iter_id}}`}
                  selected={
                    selected && selected.mod_iter_id === modInfo.mod_iter_id
                  }
                  onClick={handleClick}
                >
                  <ModelListItemContent modelInfo={modInfo} />
                </ListItemButton>
              )
            })}
          </List>
        </Box>
        <Box className="pagination-area">
          <Pagination
            page={showSearchResult ? searchPageNum : page}
            count={Math.ceil(dispModels.totalCnt / pageSize)}
            size="small"
            onChange={debouncedHandlePageChange}
          />
          <Box>{`${m.total}${dispModels.totalCnt}`}</Box>
        </Box>
      </Box>
    ),
    [
      selected,
      dispModels,
      showSearchResult,
      page,
      debouncedHandlePageChange,
      onSelect,
      searchPageNum,
      m.total
    ]
  )

  return (
    <Box className="model-selectsearch-wrapper">
      <DialogTitle>
        <Box className="searchbar-wrapper">
          <SearchBar
            disabled={fetchLoading}
            onRequestSearch={handleReqSearch}
            onCancelSearch={handleCancelSearch}
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        {fetchLoading ? LoadingElem : ModelListElem}
      </DialogContent>
    </Box>
  )
}
