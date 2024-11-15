import sqlite3
import json
import matplotlib.pyplot as plt
import pandas as pd
import os

# Specify the path to your SQLite database file
db_file_path = 'database.db'

def fetch_data_from_db(table_name):
    # Connect to the SQLite database
    connection = sqlite3.connect(db_file_path)
    
    try:
        # Query to fetch all data from the table
        query = f"SELECT * FROM {table_name}"
        df = pd.read_sql(query, connection)
        
        # Convert the DataFrame to a dictionary
        data = df.to_dict(orient='records')
        return data
    except Exception as e:
        return {"error": str(e)}
    finally:
        connection.close()

def generate_bar_graph():
    # Example data for graph (you can modify this based on your data)
    categories = ['Category 1', 'Category 2', 'Category 3']
    values = [10, 20, 30]

    # Create a bar graph
    plt.bar(categories, values, color='blue')
    plt.xlabel('Categories')
    plt.ylabel('Values')
    plt.title('Sample Bar Graph')

    # Define the directory to save the graph
    image_dir = 'codes'
    os.makedirs(image_dir, exist_ok=True)  # Create directory if it doesn't exist
    image_path = os.path.join(image_dir, 'bar_graph.png')

    # Save the graph as an image in the specified directory
    plt.savefig(image_path)
    plt.close()

    return image_path

def generate_json_data(table_name):
    # Fetch data from the database
    db_data = fetch_data_from_db(table_name)

    # Generate the bar graph and get the image path
    image_path = generate_bar_graph()

    # Prepare the data in JSON format
    data = {
        "outputs": [
            {
                "type": "graph",
                "location": image_path
            },
            {
                "type": "text",
                "message": "Graph generated successfully"
            },
            {
                "type": "database",
                "data": db_data
            }
        ]
    }

    # Return the JSON data as a string
    return json.dumps(data)

if __name__ == "__main__":
    table_name = 'project_6714381003db4bf72acf0b10'  # Specify your actual table name
    print(generate_json_data(table_name))  # Output the JSON data
