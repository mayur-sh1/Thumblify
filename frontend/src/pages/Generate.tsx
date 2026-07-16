import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { colorSchemes, dummyThumbnails, type AspectRatio, type IThumbnail, type ThumbnailStyle } from '../assets/assets';
import SoftBackDrop from '../components/SoftBackDrop.tsx';
import AspectRatioSelector from '../components/AspectRatioSelector.tsx';
import StyleSelector from '../components/StyleSelector.tsx';
import ColorSchemeSelector from '../components/ColorSchemeSelector.tsx';
import PreviewPanel from '../components/PreviewPanel.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import toast from 'react-hot-toast';
import api from '../configs/api.ts';

const Generate = () => {
  const { id } = useParams();
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [title, setTitle] = useState("")
  const [additionalDetails, setAdditionalDetails] = useState("")

  const [thumbnail, setThumbnail] = useState<IThumbnail | null>(null)
  const [loading, setLoading] = useState(false)

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9")
  const [colorSchemeId, setColorSchemeId] = useState<string>(colorSchemes[0].id)

  const [style, setStyle] = useState<ThumbnailStyle>('Bold & Graphic')
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false)

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      return toast.error('Please log in to generate thumbnail')
    }
    if (!title.trim()) return toast.error('Title is required')

    setLoading(true)

    const api_payload = {
      title,
      prompt: additionalDetails,
      style,
      aspect_ratio: aspectRatio,
      color_scheme: colorSchemeId,
      text_overlay: true,
    }

    try {
      const { data } = await api.post('/api/thumbnail/generate', api_payload)
      if (data.thumbnail) {
        navigate('/generate/' + data.thumbnail._id)
        toast.success(data.message)
      }
    } catch (error: any) {
      const status = error?.response?.status
      const message = error?.response?.data?.message

      // Gemini quota/billing issue — fall back to a dummy thumbnail so the
      // rest of the flow (preview, download, etc.) remains demoable.
      if (status === 429 || status === 503) {
        toast('AI generation is temporarily unavailable — showing a demo result.', { icon: '⚠️' })

        const randomDummy = dummyThumbnails[Math.floor(Math.random() * dummyThumbnails.length)]

        const fallback = {
          ...(randomDummy as any),
          _id: `demo-${Date.now()}`,
          title,
          user_prompt: additionalDetails,
          style,
          aspect_ratio: aspectRatio,
          color_scheme: colorSchemeId,
          isGenerating: false,
          createdAt: new Date().toISOString(),
        }
        setThumbnail(fallback)
        setLoading(false)
        return
      }

      toast.error(message || "Something went wrong while generating the thumbnail.")
    } finally {
      setLoading(false)
    }
  }

  const fetchThumbnail = async () => {
    // if this id belongs to dummy/demo data, populate directly — don't hit the real API
    const dummyMatch = dummyThumbnails.find((t: any) => t._id === id)

    if (dummyMatch) {
      setThumbnail(dummyMatch as unknown as IThumbnail)
      setLoading(false)
      setAdditionalDetails((dummyMatch as any).user_prompt ?? "")
      setTitle((dummyMatch as any).title ?? "")
      setColorSchemeId((dummyMatch as any).color_scheme ?? colorSchemes[0].id)
      setAspectRatio((dummyMatch as any).aspect_ratio ?? "16:9")
      setStyle((dummyMatch as any).style ?? "Bold & Graphic")
      return
    }

    try {
      const { data } = await api.get(`/api/user/thumbnail/${id}`)
      setThumbnail(data?.thumbnail as IThumbnail)
      setLoading(!data?.thumbnail?.image_url)
      setAdditionalDetails(data?.thumbnail?.user_prompt ?? "")
      setTitle(data?.thumbnail?.title ?? "")
      setColorSchemeId(data?.thumbnail?.color_scheme ?? colorSchemes[0].id)
      setAspectRatio(data?.thumbnail?.aspect_ratio ?? "16:9")
      setStyle(data?.thumbnail?.style ?? "Bold & Graphic")
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    const isDummy = dummyThumbnails.some((t: any) => t._id === id)

    if (isLoggedIn && id) {
      fetchThumbnail()
    }
    if (id && isLoggedIn && loading && !isDummy) {
      const interval = setInterval(() => {
        fetchThumbnail()
      }, 5000);
      return () => clearInterval(interval)
    }
  }, [id, loading, isLoggedIn])


  useEffect(() => {
    if (!id && thumbnail && !thumbnail._id.startsWith('demo-')) {
      setThumbnail(null)
    }
  }, [pathname])

  return (
    <>
      <SoftBackDrop />
      <div className='pt-24  min-h-screen'>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8">
          <div className="grid lg:grid-cols-[400px_1fr] gap-8">
            {/* Left panel */}
            <div className={`space-y-6 ${id && 'pointer-events-none'}`}>
              <div className="p-6 rounded-2xl bg-white/8 border border-white/12 shadow-xl space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-zinc-100 mb-1">Create your Thumbnail</h2>
                  <p className="text-sm text-zinc-400">Describe the vision and let AI bring it to life</p>
                </div>
                <div className='space-y-5'>
                  {/* title input */}
                  <div className='space-y-2'>
                    <label className="block text-sm font-medium"> Topic or Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} placeholder="e.g., 10 Tips for Better Sleep" className="w-full px-4 py-3 rounded-lg border border-white/12 bg-black/20 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500" />
                    <div className="flex justify-end">
                      <span className="text-xs text-zinc-400">
                        {title?.length ?? 0}/100
                      </span>
                    </div>
                  </div>
                  {/* aspect ratio selector */}
                  <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                  {/* style selector */}
                  <StyleSelector value={style} onChange={setStyle} isOpen={styleDropdownOpen} setIsOpen={setStyleDropdownOpen} />
                  {/* color pallete selector */}
                  <ColorSchemeSelector value={colorSchemeId} onChange={setColorSchemeId} />

                  {/* details */}
                  <div className='space-y-2'>
                    <label className='block text-sm font-medium'>Additional Prompts <span className='text-zinc-400 text-xs'>(optional)</span></label>
                    <textarea value={additionalDetails} onChange={(e) => setAdditionalDetails(e.target.value)} rows={3} placeholder="Add any specific elements, mood, or style preferences..." className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/6 text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"></textarea>

                  </div>
                </div>
                {/* button */}
                {!id && (<button onClick={handleGenerate} disabled={loading} className="text-[15px] w-full py-3.5 rounded-xl font-medium bg-linear-to-b from-pink-500 to-pink-600 hover:from-pink-700 disabled:cursor-not-allowed transition-colors">
                  {loading ? "Generating..." : "Generate Thumbnail"}
                </button>)}

              </div>
            </div>
            {/* right panel */}
            <div>
              <div className='p-6 rounded-2xl bg-white/8 border border-white/10 shadow-xl'>
                <h2 className='text-lg font-semibold text-zinc-100 mb-4'>Preview</h2>
                <PreviewPanel thumbnail={thumbnail} isLoading={loading} aspectRatio={aspectRatio} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

export default Generate