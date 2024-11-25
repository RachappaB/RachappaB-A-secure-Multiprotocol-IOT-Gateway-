import sys
import json
import matplotlib.pyplot as plt
import os
import random

def generate_random_bar_graph():
    categories = [f'Category {i+1}' for i in range(5)]  # 5 categories
    values = [random.randint(1, 100) for _ in range(5)]  # Random values between 1 and 100

    plt.bar(categories, values, color='blue')
    plt.xlabel('ssss')
    plt.ylabel('sss')
    plt.title('Random Bar Graph')

    image_dir = 'codes'
    os.makedirs(image_dir, exist_ok=True)
    image_path = os.path.join(image_dir, 'random_bar1_graph.png')

    plt.savefig(image_path)
    plt.close()

    return image_path

def generate_json_data(file_details):
    # Generate the bar graph and get the image path
    image_path = generate_random_bar_graph()

    # Prepare the data in JSON format
    data = {
        "outputs": [
            {"type": "graph", "location": image_path},
            {"type": "text", "message": "Random graph generated successfully"},
            {"type": "file", "details": file_details}
        ]
    }

    return json.dumps(data)

if __name__ == "__main__":
    # Get the file details passed from the Node.js script
    file_details_json = sys.argv[1]  # The first argument passed is the file details in JSON format
    file_details = json.loads(file_details_json)  # Parse the JSON string into a Python dictionary
    
    # Generate JSON data to return
    print(generate_json_data(file_details))

