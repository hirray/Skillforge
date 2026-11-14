"""Generate small, text-layer PDF fixtures without external binaries."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1] / 'tests' / 'fixtures'

def pdf(lines: list[str]) -> bytes:
    content = 'BT /F1 11 Tf 50 790 Td 16 TL\n' + '\n'.join('(' + line.replace('\\','\\\\').replace('(','\\(').replace(')','\\)') + ') Tj T*' for line in lines) + '\nET'
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>', b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>', b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>', f'<< /Length {len(content.encode())} >>\nstream\n{content}\nendstream'.encode()]
    result = b'%PDF-1.4\n'; offsets = [0]
    for i,obj in enumerate(objects,1):
        offsets.append(len(result)); result += f'{i} 0 obj\n'.encode()+obj+b'\nendobj\n'
    start=len(result); result += f'xref\n0 {len(objects)+1}\n0000000000 65535 f \n'.encode()
    result += b''.join(f'{o:010d} 00000 n \n'.encode() for o in offsets[1:])
    return result+f'trailer << /Size {len(objects)+1} /Root 1 0 R >>\nstartxref\n{start}\n%%EOF'.encode()

SAMPLES = [
    ('frontend', ['Maya Chen','maya@example.com','Skills','React, TypeScript, Node.js','Experience','Northstar Labs | Frontend Engineer | 2022 - 2025','Education','Example University | BSc Computer Science | 2018 - 2022','Projects','Creator dashboard using React','https://example.com/maya'], ['React','TypeScript','Node.js']),
    ('ml', ['Neha Iyer','neha@example.com','Technical Skills','Python, Machine Learning, Computer Vision','Work Experience','Research Lab | ML Engineer | 2021 - Present','Education','Example Institute | MSc Data Science | 2019 - 2021','Certifications','Machine Learning Certificate | Example Academy | 2023'], ['Python','Machine Learning','Computer Vision']),
    ('cloud', ['Omar Khan','omar@example.com','Skills','AWS, Docker, CI/CD','Experience','Cloud Studio | Cloud Engineer | 2020 - 2025','Education','Example College | BEng | 2016 - 2020'], ['AWS','Docker','CI/CD']),
    ('designer', ['Leena Shah','leena@example.com','Skills','Figma, UI/UX Design','Experience','Design Studio | Product Designer | 2022 - Present','Education','Example School | BDes | 2018 - 2022','Projects','Accessible design system'], ['Figma','UI/UX Design']),
    ('ambiguous', ['Alex Morgan','alex@example.com','Skills','Python, React, UnlistedTool','Experience','Freelance software development','Education','Computer science studies','https://example.com/alex'], ['Python','React']),
]

if __name__ == '__main__':
    ROOT.mkdir(parents=True,exist_ok=True)
    for name,lines,skills in SAMPLES:
        (ROOT/f'{name}.pdf').write_bytes(pdf(lines))
        (ROOT/f'{name}.golden.json').write_text(json.dumps({'name':lines[0],'skills':skills,'ambiguousDates':name=='ambiguous'},indent=2)+'\n')
    (ROOT/'no-text.pdf').write_bytes(pdf([]))
    print('Generated five synthetic resumes, golden expectations, and a no-text PDF.')
