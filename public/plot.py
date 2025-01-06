import io
import base64

# Generate random data
x = np.linspace(0, 10, 100)
y = np.sin(x) + np.random.normal(0, 0.1, 100)

# Create plot
plt.figure(figsize=(8, 6))
plt.plot(x, y, 'b-', label='Random Data')
plt.title('Random Plot')
plt.xlabel('X axis')
plt.ylabel('Y axis')
plt.grid(True)
plt.legend()

# Save plot to bytes buffer
buffer = io.BytesIO()
plt.savefig(buffer, format='png')
plt.close()

# Convert to base64 string
buffer.seek(0)
plot_data = base64.b64encode(buffer.read()).decode('utf-8')
plot_data