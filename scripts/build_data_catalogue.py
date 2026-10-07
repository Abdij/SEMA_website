"""Build the public catalogue from the supplied, dated reference documents.

This does not query IMSMA or change the source PDF. Run from the repository root.
"""
from pathlib import Path
import re
import zipfile
import xml.etree.ElementTree as ET

from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/pdf/SEMA_Mine_Action_Data_Catalogue.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
FONT_DIR = Path("C:/Windows/Fonts")
for name, file in [("Arial", "arial.ttf"), ("Arial-Bold", "arialbd.ttf"), ("Arial-Italic", "ariali.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / file)))
pdfmetrics.registerFontFamily("Arial", normal="Arial", bold="Arial-Bold", italic="Arial-Italic", boldItalic="Arial-Bold")

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
with zipfile.ZipFile(ROOT / "data_catalogue/IMSMA Core Geographic Data Catalogue.docx") as z:
    document = ET.fromstring(z.read("word/document.xml"))
tables = []
for table in document.findall(".//w:tbl", NS):
    tables.append([[" ".join(t.text or "" for t in cell.findall(".//w:t", NS))
                    for cell in row.findall("w:tc", NS)] for row in table.findall("w:tr", NS)])
states, regions = tables[:2]
number = lambda value: int(value.replace(",", ""))
totals = [sum(number(row[col]) for row in states[1:]) for col in range(1, 5)]
assert totals == [3341, 1641, 11233, 38156]
assert totals == [sum(number(row[col]) for row in regions[1:]) for col in range(2, 6)]
cha, sha = [sum(number(row[col]) for row in regions[1:]) for col in (6, 7)]
assert (cha, sha) == (368, 109)
original = PdfReader(ROOT / "data_catalogue/archive/SEMA_Mine_Action_Data_Catalogue_v1.1.pdf")
hazard_text = next(p.extract_text() for p in original.pages
                   if all(label in p.extract_text() for label in ["Open", "Closed", "Cancelled", "Suspended"]))
statuses = [(label, int(re.search(re.escape(label) + r"\s+(\d+)", hazard_text).group(1)))
            for label in ["Open", "Closed", "Cancelled", "Released", "Suspended", "In progress"]]
assert sum(value for _, value in statuses) == 477
assert sum(number(row[8]) for row in regions[1:]) == dict(statuses)["Open"]
assert sum(number(row[9]) for row in regions[1:]) == sum(dict(statuses)[key] for key in ["Closed", "Released", "Cancelled"])

W, H = 595.276, 841.89
M, CW = 43, W - 86
# Match app/globals.css: navy / blue, pale blue panels and restrained red accents.
NAVY = colors.HexColor("#08375A")
TEAL = colors.HexColor("#007C7A")
BLUE = colors.HexColor("#126AA4")
INK = colors.HexColor("#111827")
MUTED = colors.HexColor("#5F6B76")
PALE = colors.HexColor("#E8F4FB")
LINE = colors.HexColor("#DBE7EF")
RED = colors.HexColor("#C1121F")
WHITE = colors.white
C = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
C.setTitle("SEMA Mine Action Data Catalogue | Version 1.2 | 7 October 2026")
C.setAuthor("Somalia Explosive Management Authority")
C.setSubject("Public metadata guide based on supplied IMSMA reference, 6 October 2026")
C.setCreator("SEMA catalogue publication workflow")
REQUEST = "https://sema.org.so/en/data-request"


def para(text, x, top, width, size=10.5, color=INK, bold=False, leading=None):
    style = ParagraphStyle("body", fontName="Arial-Bold" if bold else "Arial", fontSize=size,
                           leading=leading or size * 1.42, textColor=color)
    p = Paragraph(text, style)
    _, height = p.wrap(width, 750)
    if top + height > 790:
        raise ValueError(f"Text overflow on page {C.getPageNumber()}: {text[:70]}")
    p.drawOn(C, x, H-top-height)
    return top + height


def box(x, top, width, height, fill=PALE, stroke=None, radius=10):
    C.setFillColor(fill)
    C.setStrokeColor(stroke or fill)
    C.roundRect(x, H-top-height, width, height, radius, stroke=bool(stroke), fill=1)


def tag(text, top, x=M, color=TEAL):
    return para(text.upper(), x, top, CW, 8, color, True, 11)


def note(title, text, top, height=90, fill=PALE, color=BLUE):
    box(M, top, CW, height, fill)
    y = para(title.upper(), M+16, top+14, CW-32, 8.2, color, True)
    end = para(text, M+16, y+7, CW-32, 10)
    assert end <= top + height - 9, (title, end, top+height)
    return top + height


def page(title, eyebrow, index, source="Source: supplied IMSMA reference [1]; editorial review, 6 Oct 2026."):
    C.bookmarkPage(f"page-{index}")
    C.addOutlineEntry(title, f"page-{index}", level=0)
    C.setFillColor(NAVY); C.rect(0, H-99, W, 99, fill=1, stroke=0)
    C.setFillColor(RED); C.rect(0, H-99, 8, 99, fill=1, stroke=0)
    para(eyebrow.upper(), M, 25, CW-38, 8, colors.HexColor("#B8DEF4"), True)
    para(title, M, 45, CW-22, 23, WHITE, True, 27)
    C.setStrokeColor(LINE); C.line(M, 59, W-M, 59)
    C.setFont("Arial", 8); C.setFillColor(MUTED)
    C.drawString(M, 39, "SEMA Mine Action Data Catalogue | v1.2")
    C.setFont("Arial-Bold", 9); C.setFillColor(BLUE); C.drawRightString(W-M, 39, f"{index:02d} / 10")
    C.setFont("Arial", 7.2); C.setFillColor(MUTED); C.drawString(M, 67, source)


def table(data, top, widths, font=9, row_height=None, padding=8):
    style = ParagraphStyle("cell", fontName="Arial", fontSize=font, leading=font*1.35, textColor=INK)
    heading = ParagraphStyle("heading", parent=style, fontName="Arial-Bold", textColor=WHITE)
    cells = [[Paragraph(str(v), heading if i == 0 else style) for v in row] for i, row in enumerate(data)]
    t = Table(cells, colWidths=widths, rowHeights=row_height)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), NAVY), ("VALIGN", (0,0), (-1,-1), "TOP"),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [WHITE, PALE]),
        ("LEFTPADDING", (0,0), (-1,-1), 9), ("RIGHTPADDING", (0,0), (-1,-1), 9),
        ("TOPPADDING", (0,0), (-1,-1), padding), ("BOTTOMPADDING", (0,0), (-1,-1), padding),
        ("LINEBELOW", (0,-1), (-1,-1), .5, LINE),
    ]))
    _, height = t.wrap(CW, 700)
    assert top+height < 755, (C.getPageNumber(), top+height)
    t.drawOn(C, M, H-top-height)
    return top+height


def finish():
    C.showPage()


# 1 - Cover. The document describes a dated source snapshot, not a live feed.
C.bookmarkPage("page-1"); C.addOutlineEntry("SEMA Mine Action Data Catalogue", "page-1", level=0)
C.setFillColor(NAVY); C.rect(0, 0, W, H, fill=1, stroke=0)
C.setFillColor(BLUE); C.circle(W+110, H-150, 290, fill=1, stroke=0)
C.setFillColor(RED); C.rect(0, 0, 12, H, fill=1, stroke=0)
box(M, 48, 64, 64, WHITE, radius=10)
C.drawImage(str(ROOT / "public/images/sema-logo.png"), M+7, H-105, 50, 50, preserveAspectRatio=True, anchor="c", mask="auto")
para("SOMALIA EXPLOSIVE<br/>MANAGEMENT AUTHORITY", M+82, 58, 350, 12, WHITE, True)
para("PUBLIC INFORMATION REFERENCE", M, 187, CW, 9, colors.HexColor("#B8DEF4"), True)
para("MINE ACTION<br/>DATA CATALOGUE", M, 226, CW, 38, WHITE, True, 44)
para("Know what information is recorded.<br/>Understand its limits.<br/>Submit a focused request.", M, 345, 420, 17, WHITE, leading=26)
box(M, 487, CW, 114, BLUE)
for x, value, label in [(M+20, "6", "dataset categories"), (M+186, "54,371", "point records"), (M+363, "478", "hazard records")]:
    para(value, x, 511, 140, 28, WHITE, True)
    para(label, x, 551, 140, 9, WHITE)
para("Source snapshot: 6 October 2026<br/>Revised public edition: 7 October 2026 | Version 1.2", M, 651, CW, 10, WHITE)
para("Metadata for discovery. Data release remains subject to SEMA review.", M, 708, CW, 10, colors.HexColor("#B8DEF4"))
para('<link href="https://sema.org.so" color="#FFFFFF">sema.org.so</link>', M, 768, CW, 11, WHITE, True)
finish()

# 2 - Purpose and use.
page("How to use this catalogue", "Public data discovery guide", 2)
y = para("This catalogue helps government institutions, operators, humanitarian partners, researchers and the public describe an information need before submitting it to SEMA.", M, 128, CW, 12)
for top, number_, title, body in [
    (205, "01", "Choose the dataset", "Use the national summary and dataset guide on pages 3-4. Counts show records identified in the supplied source, not records approved for release."),
    (319, "02", "Define place and period", "Use the regional summary on page 5, then read the location and time cautions on pages 6 and 8. District or settlement coverage may need verification."),
    (433, "03", "Submit an information request", "Use the website form described on page 10. Enter the dataset, location, dates, level of detail and purpose yourself; this PDF does not prefill the form."),
]:
    box(M, top, CW, 98, WHITE, LINE)
    para(number_, M+15, top+18, 45, 21, BLUE, True)
    para(title, M+73, top+15, CW-89, 12, NAVY, True)
    para(body, M+73, top+40, CW-89, 10)
note("No record is not evidence of no contamination", "No records identified in the currently available catalogue does not mean a hazard or activity does not exist. Data availability requires verification.", 553, 94)
para("<b>Scope:</b> This is a dated public metadata reference, not a live database or an unrestricted data release. The supplied reference describes queries run on 6 October 2026. This editorial revision reconciles its tables; it does not represent a new IMSMA extraction.", M, 674, CW, 10)
finish()

# 3 - National indicators with clear units.
page("National data snapshot", "Counts in the supplied source", 3)
para("Four populated point datasets reconcile to <b>54,371 records</b> in both the state and region tables. Hazard records are a separate layer and should not be added to the point records as a count of unique incidents or locations.", M, 127, CW, 11)
cards = [
    ("3,341", "Non-Technical Survey", "Survey records", BLUE),
    ("1,641", "Mine / ERW Accidents", "Accident records, not a victim count", RED),
    ("11,233", "Explosive Ordnance Disposal", "Task records, not a device count", TEAL),
    ("38,156", "Risk Education", "Activity records, not people reached", BLUE),
    ("478", "Hazardous Areas", "478 records; 477 spatially attributed", TEAL),
    ("0*", "Clearance / Land Release", "No shared records identified", MUTED),
]
cardw = (CW-16)/2
for i,(value,title,caption,color) in enumerate(cards):
    x=M+(i%2)*(cardw+16); top=217+(i//2)*132
    box(x,top,cardw,116,WHITE,LINE)
    C.setFillColor(color); C.rect(x+12,H-top-5,cardw-24,3,fill=1,stroke=0)
    para(value,x+14,top+16,cardw-28,28,color,True)
    para(title,x+14,top+59,cardw-28,11,NAVY,True)
    para(caption,x+14,top+83,cardw-28,8.5)
para("*The original catalogue overview reports zero records in the shared clearance progress / cleared-area layers. The supplied geographic reference does not independently tabulate that layer. This is not evidence of zero clearance activity.", M, 623, CW, 9.5)
note("Visibility limits apply", "Some partner-held records were outside the source review's access scope. These counts describe the accessible source snapshot, not complete national mine-action activity.", 686, 75)
finish()

# 4 - Dataset descriptions; availability is separate from permission.
page("Choose a dataset", "Dataset guide", 4, "Sources: supplied reference [1] and original catalogue overview [2].")
para("Use these descriptions to frame a request. SEMA will confirm the available fields, quality, geographic detail and release conditions for the requested extract.", M, 126, CW, 11)
data = [["Dataset", "Records", "What to request / key limit"],
    ["<b>Non-Technical Survey (NTS)</b>", "3,341", "Survey summaries and recorded contamination indicators. Verify the relevant survey dates and locations."],
    ["<b>Hazardous Areas</b>", "478", "CHA / SHA summaries and recorded status. Spatial coverage is available for 477 records; status is a snapshot."],
    ["<b>Mine / ERW Accidents</b>", "1,641", "Aggregate accident trends by period and area. Personal and protection-sensitive information requires review."],
    ["<b>Explosive Ordnance Disposal (EOD)</b>", "11,233", "Task summaries and, where releasable, related ordnance information. Task totals are not device totals."],
    ["<b>Explosive Ordnance Risk Education (EORE)</b>", "38,156", "Activity summaries and aggregate reach where validated. Record totals are not unique beneficiary totals."],
    ["<b>Clearance / Land Release</b>", "0 reported*", "Ask SEMA to verify availability. A closed or released hazard record is not a substitute for a clearance output dataset."],
]
y=table(data,192,[153,66,CW-219],9.6)
note("Available does not mean open for download", "Availability describes catalogue evidence. Record-level data, precise locations and partner-restricted material may require approval, aggregation or a data-sharing agreement.",y+25,91)
para("*Shared-layer figure reported in the original overview; see the qualification on page 3. ERW means explosive remnants of war. CHA and SHA are defined on page 7.",M,y+132,CW,9.3)
finish()

# 5 - Add a reconciled, useful regional table instead of an illustrative map.
page("Records by region", "Geographic catalogue", 5)
para("Point records use the source's recorded region value. Hazard counts use spatial attribution. A zero means no records identified in this source category; it does not establish absence of hazards or activities.",M,125,CW,10)
regional = [["Region / source value", "NTS", "Accidents", "EOD", "EORE", "Hazards"]]
for row in regions[1:]:
    name=row[0]
    if name.startswith("UNMATCHED"): name="Unmatched geometry*"
    if name=="null (missing)": name="Missing region"
    if name in ("ayn","nugal"): name=f'"{name}" (source value)'
    hazard=number(row[6])+number(row[7])
    if row[0].startswith("UNMATCHED"): hazard=1
    regional.append([name,*row[2:6],f"{hazard:,}"])
regional.append(["<b>Total</b>",*[f"<b>{v:,}</b>" for v in totals],"<b>478</b>"])
y=table(regional,190,[161,53,66,68,77,CW-425],8.1,padding=5)
para("*One hazard record has no usable geometry in the supplied reference. Awdal and the exact spelling Nugaal have no separate row in that reference; their availability requires verification. Do not silently merge the source value \"nugal\" with Nugaal.",M,y+17,CW,9.1)
finish()

# 6 - Make the material quality limitations visible.
page("Use geography with care", "Coverage and data quality", 6)
tag("Administrative detail needs verification",127)
y=para("The supplied document provides state and region summary tables, but no usable district-by-district or settlement-by-settlement breakdown. Request those levels from SEMA rather than inferring them from regional totals.",M,151,CW,11)
note("EORE district attribution", "The source flags 8,463 of 38,156 EORE records (22.2%) recorded under \"Waaberi\" across multiple regions. Those district labels require validation before district-level comparison or mapping.",222,96)
para("<b>State and region are different views.</b> Recorded region and state labels are not a clean one-to-one hierarchy. Mudug records, for example, appear under more than one state label. Do not add state and region totals together or assign a region wholly to one state from these tables.",M,341,CW,10.5)
para("<b>Names and boundaries.</b> Preserve the source values \"ayn\" and \"nugal\" as flagged labels until reconciled. Administrative names describe source records; they do not determine political status or boundaries. Any future map should identify its boundary source and date.",M,415,CW,10.5)
tag("Reading availability labels",504)
table([
    ["Label", "Meaning"],
    ["Available", "Records identified in the current source; release is a separate decision."],
    ["Partial", "Some coverage exists, with stated gaps or quality limits."],
    ["Request / Approval Required", "SEMA review is needed before the requested data can be shared."],
    ["No shared records identified", "No records identified within the available source and query scope."],
    ["Verification required", "Evidence is insufficient to confirm coverage or interpretation."],
],529,[167,CW-167],9,padding=6)
finish()

# 7 - Retain and reconcile the status snapshot.
page("Hazardous areas: status snapshot", "CHA / SHA catalogue", 7,"Sources: overview status breakdown [2]; regional totals cross-checked against [1].")
para("<b>Confirmed Hazardous Area (CHA)</b> and <b>Suspected Hazardous Area (SHA)</b> are the two recorded area types. The supplied summaries identify 368 CHA, 109 SHA and one additional record without complete classification.",M,126,CW,11)
status_data=[["Recorded status", "Records"]]+[[name,f"{value:,}"] for name,value in statuses]+[["Classification not specified", "1"],["<b>Total</b>","<b>478</b>"]]
y=table(status_data,206,[CW-115,115],11)
note("A snapshot, not a historical status log", "These figures describe the recorded status in the source snapshot. They do not reconstruct what was open or closed at an earlier date. A past-date request needs suitable dated records and SEMA verification.",y+26,98)
para("<b>Reconciliation:</b> The six specified statuses sum to 477; the additional unclassified record brings the total to 478. Closed, Released and Cancelled sum to 180, matching the combined regional column. The reference spatially attributes 477 hazards; one lacks usable geometry.",M,y+144,CW,10)
para("<b>Interpretation:</b> Catalogue status labels are not a safety certification or permission to enter an area.",M,y+222,CW,10)
finish()

# 8 - Ask for dates without advertising nonexistent web filters.
page("Specify the period you need", "Dates and reporting", 8)
para("Enter a clear period in the website's <b>Time period</b> field. SEMA will confirm whether the requested dataset has a suitable event, survey, task or activity date and whether it supports the requested summary.",M,126,CW,11)
table([
    ["Request type", "Example wording (illustrative only)"],
    ["Exact date", "Activities dated 15 June 2024."],
    ["Month", "1 June to 30 June 2024, inclusive."],
    ["Quarter", "1 April to 30 June 2024, grouped by month."],
    ["Calendar year", "1 January to 31 December 2024, grouped by region."],
    ["Custom range", "1 July 2023 to 30 June 2024; specify the relevant activity date."],
],212,[140,CW-140],10.3)
note("Do not treat pooled dates as dataset coverage", "The reference's state and region date ranges combine information across datasets and include early-date outliers. They do not establish the earliest or latest date for each dataset in each location.",491,101)
para("<b>What changed in this edition:</b> Dataset-specific year ranges from the original overview are not repeated as confirmed coverage because the supplied geographic tables do not substantiate them. SEMA should confirm exact coverage for each request.",M,618,CW,10.5)
para("Created and last-edited timestamps are not automatically the date of an event or the date contamination began. Ask which date field is being used, and how missing or questionable dates are handled.",M,696,CW,10.5)
finish()

# 9 - Public metadata and controlled release.
page("Public metadata, reviewed release", "Access and protection", 9,"Sources: original public catalogue [2] and website request process [3].")
para("This catalogue helps identify what SEMA may be able to provide. It does not grant permission to access or redistribute the underlying records.",M,128,CW,12)
left=["Dataset names and descriptions", "Aggregate record counts", "Broad geographic coverage", "Qualified date coverage", "Recorded status categories", "Quality and access limitations", "Source snapshot and revision date"]
right=["Personal or informant details", "Sensitive victim or survivor information", "Exact sensitive hazard coordinates", "Unpublished operational records", "Partner-restricted information", "Internal access details or credentials", "Unapproved record-level exports"]
cw=(CW-18)/2
for x,title,items,color in [(M,"PUBLIC METADATA",left,BLUE),(M+cw+18,"CONTROLLED INFORMATION",right,RED)]:
    box(x,219,cw,329,WHITE,LINE)
    box(x,219,cw,42,color,radius=8)
    para(title,x+13,233,cw-26,8.4,WHITE,True)
    y=280
    for item in items:
        end=para("- "+item,x+14,y,cw-28,10)
        y=end+14
note("SEMA review determines the response", "Requests are reviewed for availability, sensitivity, intended use and release conditions. SEMA may seek clarification, provide an aggregate or public alternative, require an agreement, or decline restricted information.",576,103)
para("Approved delivery may use email, a secure download, dashboard access or a formal data-sharing agreement. Submission and acknowledgement do not constitute approval, and this catalogue does not promise a response deadline.",M,705,CW,10)
finish()

# 10 - Request route, source trail and partner marks.
page("From catalogue to request", "Next steps and sources", 10,"Design revision: 7 October 2026 | Source snapshot: 6 October 2026.")
tag("Include these details",121)
para("<b>Dataset and indicators</b> - identify the topic and fields or summary required.<br/><b>Geography</b> - name the region and any district or settlement of interest.<br/><b>Period</b> - give start and end dates and the date concept you mean.<br/><b>Purpose and detail</b> - explain the intended use and who will access the output.<br/><b>Format and deadline</b> - state your preference and any time constraint.",M,144,CW,10,leading=17)
box(M,244,CW,98,NAVY)
para("SUBMIT AN INFORMATION REQUEST",M+18,257,CW-36,8.5,colors.HexColor("#B8DEF4"),True)
para(f'<link href="{REQUEST}" color="#FFFFFF">sema.org.so/en/data-request</link>',M+18,279,CW-36,16,WHITE,True)
para('For follow-up: <link href="mailto:dahiru@sema.org.so" color="#FFFFFF">dahiru@sema.org.so</link><br/>Keep the reference displayed after successful submission.',M+18,309,CW-36,9,WHITE,leading=12)
para("The current route is a manually completed information request form. The catalogue does not promise an interactive map, combined filters or automatic form prefilling.",M,356,CW,9.2)
tag("Sources and editorial method",396)
para("<b>[1] IMSMA Core Geographic Data Catalogue.</b> Supplied reference dated 6 October 2026. State and region tables reconcile point-dataset totals, CHA/SHA totals and regional aggregates. District and settlement detail is not supplied in those tables.",M,419,CW,9.1)
para("<b>[2] SEMA Mine Action Data Catalogue.</b> Original October 2026 overview: source of the individual hazard status breakdown and reported empty shared clearance layers. These items were not independently re-queried for this edition.",M,471,CW,9.1)
para("<b>[3] SEMA website information-request workflow.</b> Form fields, review steps and the request URL were checked against the website project on 6 October 2026.",M,522,CW,9.1)
para("<b>Version 1.2 | 7 October 2026.</b> Website branding, partner logos and disclaimer added. Figures and source qualifications are unchanged from v1.1; no new IMSMA extraction. Refresh figures and source dates after a validated extract.",M,559,CW,8.7)
# Preserve original logos and their proportions. Clip only the surrounding white
# asset canvas to the placement band; never recolour or redraw the marks.
C.setStrokeColor(LINE); C.line(M,H-607,W-M,H-607)
C.saveState()
logo_clip=C.beginPath(); logo_clip.rect(M,H-705,CW,94)
C.clipPath(logo_clip,stroke=0,fill=0)
C.drawImage(str(ROOT / "assets/catalogue/immap.png"),M+25,H-702,88,88,preserveAspectRatio=True,mask="auto")
C.drawImage(str(ROOT / "assets/catalogue/netherlands-mfa.png"),M+205,H-797,250,250,preserveAspectRatio=True,mask="auto")
C.restoreState()
para("<b>Disclaimer.</b> The information in this catalogue is provided for reference. Its contents do not necessarily reflect the views of iMMAP or the Netherlands Ministry of Foreign Affairs. Data release remains subject to SEMA review.",M,714,CW,8.2,MUTED,leading=11.5)
finish()
C.save()
print(f"Created {OUT}")
