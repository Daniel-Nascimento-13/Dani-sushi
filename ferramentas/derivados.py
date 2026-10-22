"""=== DERIVADOS DA MARCA ===
GERA, A PARTIR DOS ORIGINAIS EM MARCA/ E DO POSTER DO HERO:
  PUBLIC/IMAGENS/LOGO-SEM-FUNDO-RECORTADO.WEBP  (RECORTE JUSTO, TRANSPARÊNCIA MANTIDA)
  PUBLIC/ARQUIVOS/OG-IMAGE-V2.JPG               (1200X630: POSTER À ESQUERDA, LOGO + FRASE À DIREITA)
  PUBLIC/FAVICON-32.PNG E PUBLIC/APPLE-TOUCH-ICON.PNG (DO SÍMBOLO DO PEIXE)
  PUBLIC/IMAGENS/SIMBOLO-PEIXE-MENU.WEBP        (SELO DO MENU MOBILE, 96PX DE ALTURA = 4X DE 24PX EXIBIDO)
USO (NA RAIZ DO PROJETO): python3 ferramentas/derivados.py [recorte|og|favicons|selo]  (SEM ARGUMENTO, GERA TODOS)
"""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

FUNDO = (11, 9, 8)
TEXTO_2 = (189, 181, 174)
FONTE = 'node_modules/@fontsource/shippori-mincho/files/shippori-mincho-latin-400-normal.woff2'
FRASE = 'Sushi bar ao vivo · Desde 2020'

LOGO_ORIGINAL = Path('marca/logo-sem-fundo.webp')
SIMBOLO = Path('marca/simbolo-peixe.webp')
LOGO_RECORTADO = Path('public/imagens/logo-sem-fundo-recortado.webp')
POSTER = Path('public/imagens/hero-poster.jpg')
OG = Path('public/arquivos/og-image-v2.jpg')
SELO_MENU = Path('public/imagens/simbolo-peixe-menu.webp')


# === RECORTE JUSTO DO LOGO (MARGEM DE 2PX) ===
def gerar_recorte():
    logo = Image.open(LOGO_ORIGINAL).convert('RGBA')
    caixa = logo.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    margem = 2
    logo = logo.crop((caixa[0] - margem, caixa[1] - margem, caixa[2] + margem, caixa[3] + margem))
    logo.save(LOGO_RECORTADO, 'WEBP', quality=90, method=6, exact=True)
    print(f'{LOGO_RECORTADO} {logo.size[0]}x{logo.size[1]} (atualize width/height dos <img> se mudar)')


# === OG-IMAGE 1200X630 ===
def gerar_og():
    og = Image.new('RGB', (1200, 630), FUNDO)

    poster = Image.open(POSTER).convert('RGB')
    escala = max(600 / poster.width, 630 / poster.height)
    poster = poster.resize((round(poster.width * escala), round(poster.height * escala)), Image.LANCZOS)
    x, y = (poster.width - 600) // 2, (poster.height - 630) // 2
    og.paste(poster.crop((x, y, x + 600, y + 630)), (0, 0))

    altura_logo = 220
    logo = Image.open(LOGO_RECORTADO).convert('RGBA')
    logo = logo.resize((round(logo.width * altura_logo / logo.height), altura_logo), Image.LANCZOS)
    fonte = ImageFont.truetype(FONTE, 30)
    caixa = fonte.getbbox(FRASE)
    espaco = 40
    topo = (630 - (altura_logo + espaco + (caixa[3] - caixa[1]))) // 2

    og = og.convert('RGBA')
    og.alpha_composite(logo, (600 + (600 - logo.width) // 2, topo))
    ImageDraw.Draw(og).text(
        (600 + (600 - (caixa[2] - caixa[0])) // 2 - caixa[0], topo + altura_logo + espaco - caixa[1]),
        FRASE, font=fonte, fill=TEXTO_2,
    )
    OG.parent.mkdir(parents=True, exist_ok=True)
    og.convert('RGB').save(OG, 'JPEG', quality=82, optimize=True, progressive=True)
    print(OG)


# === FAVICONS (SÍMBOLO CENTRALIZADO) ===
def encaixar(simbolo, lado, respiro, fundo):
    util = round(lado * (1 - 2 * respiro))
    copia = simbolo.copy()
    copia.thumbnail((util, util), Image.LANCZOS)
    tela = Image.new('RGBA', (lado, lado), fundo)
    tela.alpha_composite(copia, ((lado - copia.width) // 2, (lado - copia.height) // 2))
    return tela


def gerar_favicons():
    simbolo = Image.open(SIMBOLO).convert('RGBA')
    encaixar(simbolo, 32, 0, (0, 0, 0, 0)).save('public/favicon-32.png', optimize=True)
    encaixar(simbolo, 180, 0.14, (*FUNDO, 255)).convert('RGB').save('public/apple-touch-icon.png', optimize=True)
    print('public/favicon-32.png public/apple-touch-icon.png')


# === SELO DO MENU MOBILE (ALTURA 96PX, PROPORÇÃO MANTIDA) ===
def gerar_selo():
    simbolo = Image.open(SIMBOLO).convert('RGB')
    altura = 96
    selo = simbolo.resize((round(simbolo.width * altura / simbolo.height), altura), Image.LANCZOS)
    selo.save(SELO_MENU, 'WEBP', quality=85, method=6)
    print(f'{SELO_MENU} {selo.width}x{selo.height} (exibido a {round(selo.width / 4)}x24: atualize width/height dos <img> se mudar)')


TAREFAS = {'recorte': gerar_recorte, 'og': gerar_og, 'favicons': gerar_favicons, 'selo': gerar_selo}

if __name__ == '__main__':
    for nome in sys.argv[1:] or TAREFAS:
        TAREFAS[nome]()
