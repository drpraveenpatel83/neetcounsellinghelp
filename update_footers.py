import os
import re

def update_footers(directory):
    # Pattern 1: fb-right
    new_footer_1 = '''<div class="fb-right">
          <a href="about-us.html">About Us</a>
          <a href="contact-us.html">Contact Us</a>
          <a href="privacy-policy.html">Privacy Policy</a>
          <a href="terms-and-conditions.html">Terms &amp; Conditions</a>
          <a href="disclaimer.html">Disclaimer</a>
        </div>'''
    pattern_1 = re.compile(r'<div class="fb-right">.*?</div>', re.DOTALL)

    # Pattern 2: simple footer inline
    # E.g. © 2026 NEET Counselling Help &nbsp;|&nbsp;<a href="privacy-policy.html" style="color:rgba(255,255,255,.5);">Privacy Policy</a> &nbsp;|&nbsp;<a href="index.html#contact" style="color:rgba(255,255,255,.5);">Contact</a>
    # Or in privacy-policy.html: © 2026 NEET Counselling Help &nbsp;|&nbsp;\n    <a href="privacy-policy.html" style="color:rgba(255,255,255,.5);">Privacy Policy</a> &nbsp;|&nbsp;\n    <a href="index.html#contact" style="color:rgba(255,255,255,.5);">Contact</a>
    
    new_footer_2 = '© 2026 NEET Counselling Help &nbsp;|&nbsp; <a href="about-us.html" style="color:rgba(255,255,255,.5);">About Us</a> &nbsp;|&nbsp; <a href="contact-us.html" style="color:rgba(255,255,255,.5);">Contact Us</a> &nbsp;|&nbsp; <a href="privacy-policy.html" style="color:rgba(255,255,255,.5);">Privacy Policy</a> &nbsp;|&nbsp; <a href="terms-and-conditions.html" style="color:rgba(255,255,255,.5);">Terms &amp; Conditions</a> &nbsp;|&nbsp; <a href="disclaimer.html" style="color:rgba(255,255,255,.5);">Disclaimer</a>'
    
    # We will match © 2026 NEET Counselling Help up to the closing </div> of that line
    # Let's match from © 2026 NEET Counselling Help up to </a>\n</div> or similar.
    # Actually, the div has: <div style="background:#0f172a;text-align:center;padding:20px;font-size:13px;color:rgba(255,255,255,.4);">
    pattern_2 = re.compile(r'© 2026 NEET Counselling Help.*?(?=<button id="backToTop"|</div)', re.DOTALL)
    
    # Wait, some files have `© 2026 NEET Counselling Help &nbsp;|&nbsp;<a href="privacy-policy.html"...`
    # Let's replace the whole div to be safer.
    pattern_3 = re.compile(r'<div style="background:#0f172a;[^>]*>.*?© 2026 NEET Counselling Help.*?</div>', re.DOTALL)
    new_footer_3 = '''<div style="background:#0f172a; text-align:center; padding:20px; font-size:13px; color:rgba(255,255,255,.4);">
    © 2026 NEET Counselling Help &nbsp;|&nbsp;
    <a href="about-us.html" style="color:rgba(255,255,255,.5);">About Us</a> &nbsp;|&nbsp;
    <a href="contact-us.html" style="color:rgba(255,255,255,.5);">Contact Us</a> &nbsp;|&nbsp;
    <a href="privacy-policy.html" style="color:rgba(255,255,255,.5);">Privacy Policy</a> &nbsp;|&nbsp;
    <a href="terms-and-conditions.html" style="color:rgba(255,255,255,.5);">Terms &amp; Conditions</a> &nbsp;|&nbsp;
    <a href="disclaimer.html" style="color:rgba(255,255,255,.5);">Disclaimer</a>
  </div>'''

    count = 0
    for filename in os.listdir(directory):
        if filename.endswith(".html"):
            filepath = os.path.join(directory, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            content = pattern_1.sub(new_footer_1, content)
            content = pattern_3.sub(new_footer_3, content)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated footer in {filename}")
                count += 1
                
    print(f"Total files updated: {count}")

if __name__ == "__main__":
    update_footers(".")
