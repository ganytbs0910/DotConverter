import PixelArtGenerator from './PixelArtGenerator'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">8ピクセルドット絵ジェネレーター</h1>
        <PixelArtGenerator />
      </div>
    </div>
  )
}

export default App
