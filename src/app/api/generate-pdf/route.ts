import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes for large PDFs

export async function GET(request: NextRequest) {
  let browser = null

  try {
    // Get the base URL from the request
    const url = new URL(request.url)
    const baseUrl = `${url.protocol}//${url.host}`

    console.log('Starting PDF generation...')

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      protocolTimeout: 300000,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--font-render-hinting=none',
      ],
    })

    const page = await browser.newPage()

    // Set longer default timeout
    page.setDefaultTimeout(180000)
    page.setDefaultNavigationTimeout(180000)

    // Set viewport - use a taller viewport to ensure content renders
    await page.setViewport({
      width: 1200,
      height: 1600,
      deviceScaleFactor: 1,
    })

    // IMPORTANT: Emulate print media type BEFORE navigating
    // This ensures the page loads with print styles active from the start
    await page.emulateMediaType('print')

    // Navigate to the print page
    const printUrl = `${baseUrl}/print/full-book`
    console.log(`Navigating to: ${printUrl}`)

    await page.goto(printUrl, {
      waitUntil: 'networkidle2',
      timeout: 180000,
    })

    console.log('Page loaded, waiting for fonts and content...')

    // Wait for fonts to load
    await page.evaluate(() => {
      return document.fonts.ready
    })

    // Wait for all images to load with better handling
    const imageCount = await page.evaluate(async () => {
      const images = Array.from(document.querySelectorAll('img'))
      console.log(`Found ${images.length} images`)

      const imagePromises = images.map((img, index) => {
        if (img.complete && img.naturalHeight !== 0) {
          return Promise.resolve(`Image ${index}: already loaded`)
        }
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve(`Image ${index}: timeout (src: ${img.src?.substring(0, 50)}...)`)
          }, 15000) // 15s timeout per image

          img.onload = () => {
            clearTimeout(timeout)
            resolve(`Image ${index}: loaded`)
          }
          img.onerror = () => {
            clearTimeout(timeout)
            resolve(`Image ${index}: error (src: ${img.src?.substring(0, 50)}...)`)
          }
        })
      })

      const results = await Promise.all(imagePromises)
      return { count: images.length, results }
    })

    console.log(`Image loading complete: ${imageCount.count} images`)

    // Longer wait for all rendering to complete
    await new Promise(resolve => setTimeout(resolve, 5000))

    console.log('Generating PDF...')

    // Generate PDF with settings that respect CSS page breaks
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.75in',
        left: '0.5in',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="width: 100%; font-size: 9px; padding: 0 20px; text-align: center; color: #888; font-family: system-ui, sans-serif;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: false,
      timeout: 300000,
    })

    console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`)

    await browser.close()
    browser = null

    // Convert Uint8Array to Buffer for NextResponse compatibility
    const buffer = Buffer.from(pdfBuffer)

    // Return the PDF
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Practical-Jobs-to-be-Done.pdf"',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)

    if (browser) {
      try {
        await browser.close()
      } catch (closeError) {
        console.error('Error closing browser:', closeError)
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
