import React, { useCallback, useState } from 'react'
import shallow from 'zustand/shallow'
import { useStore } from '../store/useStore'
import { DrawROI, DrawPolygonControl } from 'react-draw-roi'
import { ImgSourceLocal } from './ImgSourceLocal'
import './ROIEditContent.scss'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { Toolbar } from '@mui/material'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      className="tabpanel"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  }
}

export interface ROIEditContentProps {
  regions: number[][][]
  onRegionsChange: (newRegions: number[][][]) => void
}

export const ROIEditContent = ({
  regions,
  onRegionsChange
}: ROIEditContentProps): JSX.Element => {
  const [tabId, setTabId] = useState<number>(0)

  const { roiImg, fetchROIImgLoading, d } = useStore(
    (state) => ({
      propEditingDisabled: state.propEditingDisabled,
      roiImg: state.roiImg,
      fetchROIImgLoading: state.fetchROIImgLoading,
      d: state.dictionary.node.roi.dialog
    }),
    shallow
  )

  const handleTabChange = useCallback((evt, newVal) => {
    setTabId(newVal)
  }, [])

  const handleRegionsChange = useCallback((r: number[][][]) => {
    onRegionsChange([...r])
  }, [])

  return (
    <Box className="editor-content">
      <Toolbar variant={'dense'} />
      <Box className="tab-area">
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabId}
            onChange={handleTabChange}
            aria-label="basic tabs example"
          >
            <Tab label={d.cameraTab} {...a11yProps(0)} />
            <Tab label={d.localTab} {...a11yProps(1)} />
          </Tabs>
        </Box>
        <TabPanel value={tabId} index={0}>
          {/* <ImgSourceCam /> */}
        </TabPanel>
        <TabPanel value={tabId} index={1}>
          <ImgSourceLocal />
        </TabPanel>
      </Box>
      <Box className="canvas-and-control-area">
        {fetchROIImgLoading ? (
          <CircularProgress />
        ) : (
          <Box className="canvas-area">
            <DrawROI
              imgUrl={roiImg.url}
              defaultROIs={regions}
              onROIsChange={handleRegionsChange}
            >
              <DrawPolygonControl />
            </DrawROI>
          </Box>
        )}
      </Box>
    </Box>
  )
}
