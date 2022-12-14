import React, { useState, useCallback, useMemo } from 'react'
import { Meta } from '@storybook/react/types-6-0'
import { Story } from '@storybook/react'
import {
  AIAppType,
  AppFlow,
  AppFlowProps,
  Pipeline,
  Module,
  Connection,
  FetchModelRes,
  FetchROIImgRes,
  ModuleDefinitions,
  getParsedData,
  tModuleDefinitions
} from '../AppFlow'
import { TabPanel } from './components'
import { md3 } from './datav2/md3'
import pipeline from './datav2/pipeline5.json'
import { fetchModelResult, fetchModelResult2 } from './datav2/fetchExample2'
import Editor from '@monaco-editor/react'

import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

const myPipeline: Pipeline = {
  version: '0.0.1',
  nodes: pipeline.nodes.map((node) => node as Module),
  pipe: pipeline.pipe.map((p) => p as Connection)
}

export default {
  title: 'Example/AppFlow',
  component: AppFlow
} as Meta

// Create a master template for mapping args to render the component
const handleCanvasLoad = (canvas: AIAppType): void => {
  console.log(`🍌 AppCanvas loaded`)
  canvas.layoutGraph()
}

const fetchModelList = (
  page: number,
  pageSize: number,
  queryModelName?: string,
  queryModelType?: string
): Promise<FetchModelRes> => {
  return new Promise<FetchModelRes>((resolve, reject) => {
    setTimeout(() => {
      let models = fetchModelResult.models
      let totalCnt = fetchModelResult.totalCnt
      if (queryModelType === 'classification') {
        // Pretend - filter by classification
        models = fetchModelResult2.models
        totalCnt = fetchModelResult2.totalCnt
      }
      console.log(`[story - fetcher] ${queryModelType}`)
      if (queryModelName === undefined || queryModelName === '') {
        resolve({
          models: models.slice(pageSize * (page - 1), pageSize * page),
          totalCnt
        })
      } else {
        // search by model name
        const searchRes = models.filter((mod) =>
          mod.mod_name.includes(queryModelName)
        )
        resolve({
          models: searchRes.slice(pageSize * (page - 1), pageSize * page),
          totalCnt: searchRes.length
        })
      }
    }, 2000)
  })
}

const fetchROIImg = (
  width: number,
  height: number
): Promise<FetchROIImgRes> => {
  return new Promise<FetchROIImgRes>((resolve, reject) => {
    setTimeout(() => {
      resolve({ url: `https://place-puppy.com/${width}x${height}` })
    }, 1100)
  })
}

const Template: Story<AppFlowProps> = (args) => {
  const [tabVal, setTabVal] = useState<number>(0)
  const [defaultPpVal, setDefaultPpVal] = useState<Pipeline>(myPipeline)
  const [pipelineVal, setPipelineVal] = useState<Pipeline>(myPipeline)
  const [pipelineEditStr, setPipelineEditStr] = useState<string>(
    JSON.stringify(pipelineVal, null, '\t')
  )
  const [modDef, setModDef] = useState<ModuleDefinitions>(md3)
  const [modDefEditStr, setModDefEditStr] = useState<string>(
    JSON.stringify(modDef, null, '\t')
  )
  const [saveMDErrorMsg, setSaveMDErrorMsg] = useState<string | undefined>()
  const [savePipelineErrorMsg, setSavePipelineErrorMsg] = useState<
    string | undefined
  >()

  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: number) => {
      setTabVal(newValue)
      // when switching tab -- update the default value of the AppFlow
      setDefaultPpVal(pipelineVal)
      if (newValue === 1) {
        setSavePipelineErrorMsg(undefined)
      }
      if (newValue === 2) {
        setSaveMDErrorMsg(undefined)
      }
    },
    [pipelineVal, setDefaultPpVal]
  )

  const handlePipelineEditorChange = useCallback(
    (newVal, event) => {
      console.log(`[Pipeline Editor onChange]`)
      setPipelineEditStr(newVal)
    },
    [setPipelineEditStr]
  )

  const handlePipelineSave = useCallback(() => {
    console.log(`[Pipeline Editor onSave]`)
    try {
      const p0 = JSON.parse(pipelineEditStr)
      setPipelineVal(p0)
    } catch (error) {
      console.error(error)
      setSavePipelineErrorMsg(error.message)
      throw error
    }
  }, [pipelineEditStr, setPipelineVal, setSavePipelineErrorMsg])

  const handlePipelineEditorValidation = useCallback((markers) => {
    // model markers
    console.log(`[Pipeline Editor onValidation]`)
    markers.forEach((marker) => console.log('onValidate:', marker.message))
  }, [])

  const handleValueChange = useCallback(
    (val: Pipeline): void => {
      console.log(`🦍  value changed!`)
      console.log(val)
      setPipelineVal(val)
    },
    [setPipelineVal]
  )

  const handleMDEditorChange = useCallback(
    (newVal, event) => {
      console.log(`[Model Definition Editor onChange]`)
      setModDefEditStr(newVal)
    },
    [setModDefEditStr]
  )

  const handleMDEditorSave = useCallback(() => {
    console.log(`[Model Definition Editor onSave]`)
    try {
      const modDef0 = JSON.parse(modDefEditStr)
      const modDef1 = getParsedData(modDef0, tModuleDefinitions)
      setModDef(modDef1)
    } catch (error) {
      console.error(error)
      setSaveMDErrorMsg(error.message)
      throw error
    }
  }, [modDefEditStr, setModDef, setSaveMDErrorMsg])

  const pipelineStr = useMemo(
    () => JSON.stringify(pipelineVal, null, '\t'),
    [pipelineVal]
  )

  const modDefStr = useMemo(() => JSON.stringify(modDef, null, '\t'), [modDef])

  return (
    <>
      <Tabs
        value={tabVal}
        onChange={handleTabChange}
        aria-label="pipeline-vs-tab"
      >
        <Tab label="Visualization" />
        <Tab label="Pipeline Value" />
        <Tab label="Model Definitions Config (配置文件)" />
      </Tabs>
      <TabPanel value={tabVal} index={0}>
        <div
          className="app-canvas-wrapper"
          style={{ width: '1000px', height: '500px' }}
        >
          <AppFlow
            {...args}
            defaultValue={defaultPpVal}
            moduleDefinitions={modDef}
            onValueChange={handleValueChange}
          />
        </div>
      </TabPanel>
      <TabPanel value={tabVal} index={1}>
        <div
          style={{
            width: '1000px',
            height: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Editor
            height="80%"
            defaultLanguage="json"
            defaultValue={pipelineStr}
            onChange={handlePipelineEditorChange}
            onValidate={handlePipelineEditorValidation}
          />
          <div style={{ display: 'flex', width: '100%', marginTop: '2rem' }}>
            <Button variant="contained" onClick={handlePipelineSave}>
              Save Changes
            </Button>
          </div>
          <div style={{ display: 'flex', width: '100%', marginTop: '1rem' }}>
            {savePipelineErrorMsg && (
              <Alert severity="error">
                <AlertTitle>Error Saving Pipeline</AlertTitle>
                {savePipelineErrorMsg}
              </Alert>
            )}
          </div>
        </div>
      </TabPanel>
      <TabPanel value={tabVal} index={2}>
        <div
          className="row app-canvas-wrapper"
          style={{ width: '1000px', height: '600px' }}
        >
          <Editor
            height="80%"
            defaultLanguage="json"
            defaultValue={modDefStr}
            onChange={handleMDEditorChange}
          />
          <div style={{ display: 'flex', width: '100%', marginTop: '2rem' }}>
            <Button variant="contained" onClick={handleMDEditorSave}>
              Save Changes
            </Button>
          </div>
          <div style={{ display: 'flex', width: '100%', marginTop: '1rem' }}>
            {saveMDErrorMsg && (
              <Alert severity="error">
                <AlertTitle>Error Saving Model Definitions</AlertTitle>
                {saveMDErrorMsg}
              </Alert>
            )}
          </div>
        </div>
      </TabPanel>
    </>
  )
}

// Reuse that template for creating different stories
export const BasicUsage = Template.bind({})
BasicUsage.args = {
  lang: 'cn',
  dark: false,
  hideDarkModeButton: false,
  graphEditingDisabled: true,
  onLoad: handleCanvasLoad,
  fetchModelList: fetchModelList,
  fetchROIImg: fetchROIImg
} as AppFlowProps

BasicUsage.storyName = 'Demo'
