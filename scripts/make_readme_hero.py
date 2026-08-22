from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "docs"
OUT.mkdir(exist_ok=True)
W, H = 1200, 480
INK = (5, 5, 5)
BLUE = (0, 71, 212)
YELLOW = (255, 212, 0)
SOFT = (255, 244, 168)
CYAN = (0, 217, 255)
WHITE = (255, 255, 255)
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def draw_center(draw, xy, text, fnt, fill):
    box = draw.textbbox((0, 0), text, font=fnt)
    draw.text((xy[0] - (box[2] - box[0]) / 2, xy[1] - (box[3] - box[1]) / 2), text, font=fnt, fill=fill)

def make_frame(frame):
    im = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(im)
    # Main paper board with hard offset shadow.
    d.rounded_rectangle((28, 28, W - 16, H - 22), radius=16, fill=INK)
    d.rounded_rectangle((18, 18, W - 26, H - 32), radius=16, fill=SOFT, outline=INK, width=5)
    for x in range(18, W - 26, 32):
        d.line((x, 18, x, H - 32), fill=(5, 5, 5, 28), width=1)
    for y in range(18, H - 32, 32):
        d.line((18, y, W - 26, y), fill=(5, 5, 5, 28), width=1)
    d.rounded_rectangle((18, 18, W - 26, 88), radius=16, fill=BLUE, outline=INK, width=5)
    d.line((18, 88, W - 26, 88), fill=INK, width=5)
    for x, color in ((52, YELLOW), (84, CYAN), (116, WHITE)):
        d.ellipse((x - 10, 43 - 10, x + 10, 43 + 10), fill=color, outline=INK, width=4)
    d.text((W - 354, 35), "INTERFACE RESOURCE INDEX", font=font(FONT, 16), fill=WHITE)

    # Left identity panel.
    d.rounded_rectangle((74, 128, 586, 344), radius=14, fill=INK, outline=INK, width=5)
    d.text((104, 158), "WELCOME TO", font=font(FONT, 18), fill=CYAN)
    d.text((101, 202), "DESIGN", font=font(FONT, 64), fill=YELLOW)
    d.text((101, 264), "GARAGE", font=font(FONT, 64), fill=WHITE)
    d.rectangle((105, 324, 242, 330), fill=BLUE)
    d.ellipse((259, 318, 273, 332), fill=BLUE)

    # Directory card.
    d.rounded_rectangle((680, 120, 1076, 362), radius=14, fill=INK)
    d.rounded_rectangle((668, 108, 1064, 350), radius=14, fill=WHITE, outline=INK, width=5)
    d.rounded_rectangle((690, 130, 1042, 186), radius=8, fill=BLUE, outline=INK, width=4)
    d.ellipse((711, 150, 729, 168), fill=YELLOW, outline=INK, width=3)
    d.text((750, 141), "/directory", font=font(FONT, 20), fill=WHITE)
    d.rounded_rectangle((690, 207, 1042, 250), radius=7, fill=SOFT, outline=INK, width=3)
    d.text((710, 218), "Search resources", font=font(REGULAR, 15), fill=INK)
    boxes = [(690, 275, 796, 316, YELLOW, "SEARCH", INK), (808, 275, 914, 316, CYAN, "FILTER", INK), (926, 275, 1042, 316, INK, "SHIP", WHITE)]
    for x1, y1, x2, y2, fill, label, text_color in boxes:
        d.rounded_rectangle((x1, y1, x2, y2), radius=7, fill=fill, outline=INK, width=3)
        draw_center(d, ((x1 + x2) / 2, (y1 + y2) / 2), label, font(FONT, 12), text_color)

    # Workflow footer.
    for text, x in (("SEARCH", 78), ("FILTER", 240), ("COMPARE", 400), ("SHIP", 625)):
        d.text((x, 397), text, font=font(FONT, 16), fill=INK)
    for x in (196, 356, 582):
        d.text((x, 397), "→", font=font(FONT, 17), fill=BLUE)

    # Animated scan band and status light.
    scan_x = -200 + frame * 280
    d.rectangle((scan_x, 18, scan_x + 110, H - 32), fill=(255, 255, 255), width=0)
    if frame % 2 == 0:
        d.ellipse((259, 318, 273, 332), fill=BLUE)
    return im

frames = [make_frame(i) for i in range(6)]
frames[0].save(OUT / "design-garage-readme-hero.gif", save_all=True, append_images=frames[1:], duration=520, loop=0, optimize=True)
frames[0].save(OUT / "design-garage-readme-hero-static.png")
print(f"created {OUT / 'design-garage-readme-hero.gif'}")
print(f"created {OUT / 'design-garage-readme-hero-static.png'}")
