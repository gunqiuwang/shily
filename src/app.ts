import React from 'react'
import './app.scss'

const CLOUD_ENV_ID = 'cloudbase-d7gv7tpnecde3db99'

function App(props: { children?: React.ReactNode }) {
  if (typeof wx !== 'undefined' && wx.cloud?.init) {
    wx.cloud.init({
      env: CLOUD_ENV_ID,
      traceUser: true,
    })
  }

  return props.children
}

export default App
