<?php
// Define the API endpoint and the API key
$api_url = 'https://fabers.co/cgpt/api/massageAssessment.php?api_key=2ZSVJfcHa5P72x44GBtEtS0opKT9rhYe';
$api_key = '2ZSVJfcHa5P72x44GBtEtS0opKT9rhYe';

// Check if the message is provided in the POST request
if (isset($_POST['message']) && isset($_POST['password']) && $_POST['password'] == 'JacIsSuperCute3>') {
    $message = $_POST['message'];

    // Prepare the data to be sent to the API
    $data = [
        'message' => $message,
        'api_key' => $api_key
    ];

    // Initialize cURL session
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $api_url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute cURL request
    $response = curl_exec($ch);

    // Check for errors
    if ($response === false) {
        $response = json_encode(['error' => curl_error($ch)]);
    }

    // Close cURL session
    curl_close($ch);

    // Output the response
   // header('Content-Type: application/json');
    echo $response;
} else {
    // Handle the case where the message is not provided
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No message provided']);
}
?>
