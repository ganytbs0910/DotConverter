import React, { useState, useRef } from 'react'

const PixelArtGenerator = () => {
  const [pixelSize, setPixelSize] = useState(8)
  const [images, setImages] = useState([])
  const canvasRef = useRef(null)
  const outputCanvasRef = useRef({})
  const fileInputRef = useRef(null)  // ファイル入力をリセットするために追加

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach((file, index) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setImages(prev => [...prev, {
            id: Date.now() + index,
            original: img,
            name: file.name
          }])
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  const pixelateImage = (img, canvasId) => {
    const canvas = canvasRef.current
    const outputCanvas = outputCanvasRef.current[canvasId]
    const ctx = canvas.getContext('2d')
    const outputCtx = outputCanvas.getContext('2d')

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const width = Math.floor(canvas.width / pixelSize)
    const height = Math.floor(canvas.height / pixelSize)
    outputCanvas.width = width * pixelSize
    outputCanvas.height = height * pixelSize

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const imageData = ctx.getImageData(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
        const data = imageData.data
        let r = 0, g = 0, b = 0
        
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
        }
        
        const pixelCount = data.length / 4
        r = Math.floor(r / pixelCount)
        g = Math.floor(g / pixelCount)
        b = Math.floor(b / pixelCount)

        outputCtx.fillStyle = `rgb(${r},${g},${b})`
        outputCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
      }
    }
  }

  const handleSave = (canvasId, fileName) => {
    const outputCanvas = outputCanvasRef.current[canvasId]
    if (outputCanvas) {
      const link = document.createElement('a')
      link.download = fileName
      link.href = outputCanvas.toDataURL()
      link.click()
    }
  }

  const handleSaveAndClear = (id, fileName) => {
    handleSave(id, fileName)
    // この画像を配列から削除
    setImages(prev => prev.filter(img => img.id !== id))
    // キャンバスの参照も削除
    delete outputCanvasRef.current[id]
  }

  const handleSaveAllAndClear = () => {
    images.forEach(img => {
      handleSave(img.id, img.name)
    })
    handleClearAll()
  }

  const handlePixelSizeChange = (e) => {
    const newSize = parseInt(e.target.value)
    setPixelSize(newSize)
    images.forEach(img => {
      pixelateImage(img.original, img.id)
    })
  }

  const handleClearAll = () => {
    setImages([])
    outputCanvasRef.current = {}
    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex-1">
            <span className="block mb-2 text-sm font-medium text-gray-900">ドットのサイズ（ピクセル）:</span>
            <input
              type="range"
              min="2"
              max="32"
              value={pixelSize}
              onChange={handlePixelSizeChange}
              className="w-full"
            />
            <span className="text-sm text-gray-600">{pixelSize}px</span>
          </label>
        </div>
        
        <label className="block">
          <span className="block mb-2 text-sm font-medium text-gray-900">画像を選択してください:</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>

        <div className="flex space-x-4">
          <button
            onClick={handleSaveAllAndClear}
            disabled={images.length === 0}
            className="flex-1 py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            全ての画像を保存
          </button>
          <button
            onClick={handleClearAll}
            disabled={images.length === 0}
            className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            クリア
          </button>
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {images.map((img) => (
          <div key={img.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm text-gray-600 mb-2 truncate">
              {img.name}
            </div>
            <canvas
              ref={el => {
                outputCanvasRef.current[img.id] = el
                if (el) pixelateImage(img.original, img.id)
              }}
              className="mx-auto mb-4"
            />
            <button
              onClick={() => handleSaveAndClear(img.id, img.name)}
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75"
            >
              保存
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PixelArtGenerator
