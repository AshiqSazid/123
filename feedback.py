from transformers import AutoTokenizer, AutoModelForCausalLM
import gradio as gr

tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-Instruct-v0.1")
model = AutoModelForCausalLM.from_pretrained("mistralai/Mistral-7B-Instruct-v0.1", device_map="auto")

def mistral_generate(prompt):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    outputs = model.generate(**inputs, max_new_tokens=100, temperature=0.7)
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

with gr.Blocks() as demo:
    gr.Markdown("## 🎶 Mistral Music Strategist")
    input_box = gr.Textbox(label="Enter your prompt", placeholder="e.g. Suggest viral marketing tactics for an upbeat pop track.")
    output_box = gr.Textbox(label="Mistral's Response")
    submit_btn = gr.Button("Generate")
    submit_btn.click(fn=mistral_generate, inputs=input_box, outputs=output_box)

demo.launch(share=True)
