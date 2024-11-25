import sys
import json
import sqlite3

# Function to connect to the database and fetch data based on project_id
def fetch_table_data(project_id):
    """
    This function connects to the SQLite database and fetches data from a dynamically generated table 
    based on the projectId. The table name is assumed to be 'project_<projectId>'.
    """
    db = sqlite3.connect('./database.db')  # Path to your database
    cursor = db.cursor()

    try:
        # Dynamically generate the table name based on projectId
        table_name = f"project_{project_id}"

        # Execute the SQL query to fetch data from the dynamically generated table
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()

        if rows:
            return rows
        else:
            return {"error": "No data found for the given projectId"}
    except sqlite3.Error as e:
        return {"error": f"Database error: {e}"}
    finally:
        db.close()

# Function to calculate the mean of all columns
def calculate_column_means(data):
    """
    This function takes the fetched data and calculates the mean for each column.
    """
    if not data:
        return {}

    # Transpose the data to separate columns (each column is a list of values)
    transposed_data = list(zip(*data))
    
    # Calculate the mean for each column
    column_means = []
    for column in transposed_data:
        try:
            # Convert the column to float and calculate the mean
            column_mean = sum(map(float, column)) / len(column)
            column_means.append(column_mean)
        except ValueError:
            # Handle non-numeric values
            column_means.append(None)

    return column_means





# Main function that will handle the logic
def main():
    """
    The main function that fetches data and handles the necessary logic.
    """
    # Get the file details from command line arguments (already parsed as JSON)
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File details not provided!"}))
        return

    file_details_json = sys.argv[1]
    file_details = json.loads(file_details_json)
    project_id = file_details.get("projectId", "")

    if project_id:
        # Fetch data from the database
        data = fetch_table_data(project_id)

        # Return the result as JSON
        if isinstance(data, list):  # If data is a list of rows
            # Calculate column means
            column_means = calculate_column_means(data)

            result = {
                "outputs": [
                    {"type": "text", "message": "Data fetched successfully"},
                    {"type": "mean", "means": column_means}
                ]
            }
            print(json.dumps(result))  # Return the result as JSON
        else:
            print(json.dumps(data))  # If data is an error message, return it
    else:
        print(json.dumps({"error": "projectId is missing or invalid"}))

# Entry point for the script
if __name__ == "__main__":
    main()
