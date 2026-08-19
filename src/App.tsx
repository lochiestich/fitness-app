import { Routes, Route } from 'react-router-dom'
import TabBar from './components/TabBar'
import Today from './screens/Today'
import Log from './screens/Log'
import Body from './screens/Body'
import Progress from './screens/Progress'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <main className="app__content">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/log" element={<Log />} />
          <Route path="/body" element={<Body />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </main>
      <TabBar />
    </div>
  )
}
