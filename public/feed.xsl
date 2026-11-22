<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes" />
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title><xsl:value-of select="rss/channel/title" /></title>
        <style>
          :root { color-scheme: light dark; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f7f7f5; color: #20211f; }
          * { box-sizing: border-box; }
          body { margin: 0; padding: 48px 20px; }
          main { max-width: 760px; margin: 0 auto; }
          header { padding: 12px 0 28px; border-bottom: 1px solid #d9dbd6; }
          .eyebrow { margin: 0 0 12px; color: #66715f; font-size: 12px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
          h1 { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: clamp(34px, 7vw, 52px); font-weight: 500; letter-spacing: -.04em; }
          .intro { max-width: 560px; color: #62665f; line-height: 1.65; }
          .actions { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 20px; font-size: 14px; }
          a { color: #315b39; text-decoration-thickness: 1px; text-underline-offset: 3px; }
          a:hover { text-decoration-thickness: 2px; }
          ol { list-style: none; margin: 0; padding: 0; }
          li { padding: 24px 0; border-bottom: 1px solid #d9dbd6; }
          .date { display: block; margin-bottom: 8px; color: #6d716b; font-size: 13px; }
          .item-title { font-family: Georgia, "Times New Roman", serif; font-size: 25px; line-height: 1.25; }
          .description { max-width: 620px; margin: 9px 0 0; color: #62665f; line-height: 1.65; }
          footer { padding-top: 24px; color: #777c74; font-size: 12px; }
          @media (prefers-color-scheme: dark) {
            :root { background: #171916; color: #f1f2ed; }
            header, li { border-color: #373b34; }
            .eyebrow, a { color: #adc89b; }
            .intro, .description, .date, footer { color: #b0b5ab; }
          }
          @media (max-width: 520px) { body { padding: 28px 18px; } li { padding: 20px 0; } .item-title { font-size: 22px; } }
        </style>
      </head>
      <body>
        <main>
          <header>
            <p class="eyebrow">RSS feed</p>
            <h1><xsl:value-of select="rss/channel/title" /></h1>
            <p class="intro"><xsl:value-of select="rss/channel/description" /></p>
            <p class="intro">To subscribe, copy this page’s address and add it to your RSS reader.</p>
            <nav class="actions" aria-label="Feed actions">
              <a href="writing/">Browse all writing</a>
            </nav>
          </header>
          <ol>
            <xsl:for-each select="rss/channel/item">
              <li>
                <time class="date"><xsl:value-of select="pubDate" /></time>
                <a class="item-title">
                  <xsl:attribute name="href"><xsl:value-of select="link" /></xsl:attribute>
                  <xsl:value-of select="title" />
                </a>
                <p class="description"><xsl:value-of select="description" /></p>
              </li>
            </xsl:for-each>
          </ol>
          <footer>Updated automatically when new writing is published. RSS 2.0.</footer>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
