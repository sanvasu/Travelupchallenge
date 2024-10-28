$(document).ready(function () {

    $('#openModalButton').click(function () {
        $('#itemModal').modal('show');
        $('.item-name').show();
        $('.item-description').show();
        $('.edit-name').hide();
        $('.edit-description').hide();
        $('.edit-btn').show();
        $('.save-edit').hide();

    });
    $('#itemModal').on('click', '#saveItemButton', function (event) {
        let isValid = true;
        var itemName = $('#itemName').val().trim();
        var itemDescription = $('#itemDescription').val().trim();

        if (itemName == "") {
            $('#itemName').addClass('border border-danger');
            isValid = false;
        }

        // Validate description field
        if (itemDescription == "") {
            $('#itemDescription').addClass('border border-danger');
            isValid = false;
        }
        if (!isValid) {
            event.preventDefault();
        }
        else {
            $.ajax({
                url: '/Items/AddItem',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({ name: itemName, description: itemDescription }),
                success: function (response) {
                    if (response.success) {
                        // Clear the form fields
                        $('#itemName').val('');
                        $('#itemDescription').val('');
                        $('#successMessage').text("Item Created Successfully!").show().fadeOut(3000);
                        // Optionally add the new item to the table
                        var newRow = $('<tr id="row-' + response.item.id + '">');
                        newRow.append('<td> <span class="item-id">' + response.item.id + '</span></td>');
                        newRow.append('<td><span class="item-name">' + response.item.name + '</span> <input type="text" class="edit-name" value="' + response.item.name + '" style="display:none;" /></td>');
                        newRow.append('<td><span class="item-description">' + response.item.description + '</span><input type="text" class="edit-description" value="' + response.item.description + '" style="display:none;" /></td>');
                        newRow.append('<td><button class="edit-btn" data-id="' + response.item.id + '"><i class="fas fa-edit"></i></button><button class="save-edit" data-id="' + response.item.id + '" style="display:none;"><i class="fas fa-save"></i></button><button class="delete-btn" data-id="' + response.item.id + '"><i class="fas fa-trash"></i></button></td>');
                        $('#items-list').prepend(newRow);
                        setTimeout(function () {
                            // Close the modal
                            $('#itemModal').modal('hide');
                        }, 1000);
                        $('#searchInput').val('');
                        handleSearch();

                    } else {
                        $('#itemName').val('');
                        $('#itemDescription').val('');
                        alert('Error adding item: ' + response.message);
                    }
                },
                error: function () {
                    alert('Error adding item');
                }
            });
        }

    });
    // Edit button click event
    $(document).on('click', '.edit-btn', function (e) {
        const row = $(this).closest('tr');
        row.find('.item-name').hide();
        row.find('.edit-name').show();
        row.find('.item-description').hide();
        row.find('.edit-description').show();
        $(this).hide();
        row.find('.save-edit').show();
    });

    // Save button click event
    $(document).on('click', '.save-edit', function (e) {
        let isValid = true;
        const row = $(this).closest('tr');
        const itemId = $(this).data('id');
        var itemName = row.find('.edit-name').val().trim();
        var itemDescription = row.find('.edit-description').val().trim();

        if (itemName == "") {
            row.find('.edit-name').addClass('border border-danger');
            isValid = false;
        }

        // Validate description field
        if (itemDescription == "") {
            row.find('.edit-description').addClass('border border-danger');
            isValid = false;
        }
        if (!isValid) {
            e.preventDefault();
        }
        else {
            const updatedItem = {
                Id: itemId,
                Name: row.find('.edit-name').val(),
                Description: row.find('.edit-description').val()
            };

            $.ajax({
                url: '/Items/EditItem',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(updatedItem),
                success: function (data) {
                    if (data.success) {
                        row.find('.item-name').text(updatedItem.Name).show();
                        row.find('.edit-name').hide();
                        row.find('.item-description').text(updatedItem.Description).show();
                        row.find('.edit-description').hide();
                        row.find('.save-edit').hide();
                        row.find('.edit-btn').show();
                        const tickIcon = row.find('.tick-icon');
                        tickIcon.addClass('fade-in');
                        setTimeout(() => {
                            tickIcon.removeClass('fade-in');
                            tickIcon.addClass('fade-out');
                            setTimeout(() => {
                                tickIcon.removeClass('fade-out');
                            }, 500); // Remove fade-out class after the animation
                        }, 1000); // Show tick for 1 second
                    } else {
                        alert(data.message);
                    }
                },
                error: function () {
                    alert('Error saving item');
                }
            });
        }
    });

    // Delete item click event
    $(document).on('click', '.delete-btn', function (e) {
        e.preventDefault();
        const itemId = $(this).data('id');
        const deleteItem = {
            Id: itemId
        };
        if (confirm('Are you sure you want to delete this item?')) {
            $.ajax({
                url: '/Items/DeleteItem',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(deleteItem),
                success: function (data) {
                    if (data.success) {
                        $('#row-' + itemId).remove();
                        const visibleRows = getVisibleRows();
                        const totalPages = Math.ceil(visibleRows.length / rowsPerPage);

                        if (currentPage > totalPages) {
                            currentPage = Math.max(1, totalPages);
                        }

                        updatePagination();
                    } else {
                        alert('Error deleting item');
                    }
                },
                error: function () {
                    alert('Error deleting item');
                }
            });
        }
    });
    $('#itemName, #itemDescription').on('input', function () {
        $(this).removeClass('border border-danger');
    });
    $('#itemsTable tbody').on('input', 'input', function () {
        // Get the closest row id
        $(this).removeClass('border border-danger');

        // You can use rowId as needed in your logic
    });
    $('.close').on('click', function () {
        $('#itemModal').modal('hide');  // Programmatically hide the modal
        $('#itemName').val('');
        $('#itemDescription').val('');
        $('#itemName,#itemDescription').removeClass('border border-danger');
    });
    $('#searchInput').on('input', function () {
        const searchTerm = $(this).val().toLowerCase();
        const rows = document.querySelectorAll('#itemsTable tbody tr');
        let visibleRowsCount = 0;

        rows.forEach(row => {
            const nameCell = row.cells[1].textContent.toLowerCase();
            if (nameCell.includes(searchTerm)) {
                row.style.display = '';
                visibleRowsCount++;
            } else {
                row.style.display = 'none';
            }
        });
        if (searchTerm === '') {
            currentPage = 1; 
            visibleRowsCount = rows.length;
        }
    });

    const rowsPerPage = 10;
    let currentPage = 1;


    function getAllRows() {
        return document.querySelectorAll('#itemsTable tbody tr');
    }

    function getVisibleRows() {
        const allRows = getAllRows();
        const searchTerm = $('#searchInput').val().toLowerCase();

        if (!searchTerm) {
            return allRows;
        }

        return Array.from(allRows).filter(row => {
            const nameCell = row.cells[1].textContent.toLowerCase();
            return nameCell.includes(searchTerm);
        });
    }
    function updatePagination() {
        const visibleRows = Array.from(getVisibleRows());
        const totalRows = visibleRows.length;
        const totalPages = Math.ceil(totalRows / rowsPerPage);

        // Ensure current page is valid
        if (currentPage > totalPages) {
            currentPage = Math.max(1, totalPages);
        }

        // Calculate start and end indexes for current page
        const start = (currentPage - 1) * rowsPerPage;
        const end = Math.min(start + rowsPerPage, totalRows);

        // Hide all rows first
        getAllRows().forEach(row => {
            row.style.display = 'none';
        });

        // Show only the rows for the current page
        visibleRows.slice(start, end).forEach(row => {
            row.style.display = '';
        });

        // Update pagination buttons
        $('#prevBtn').prop('disabled', currentPage === 1);
        $('#nextBtn').prop('disabled', currentPage >= totalPages);

        // Update pagination info
        const startEntry = totalRows === 0 ? 0 : start + 1;
        const endEntry = end;

        $('.pagination-info').text(
            `Showing ${startEntry} to ${endEntry} of ${totalRows} entries ` +
            `(Page ${currentPage} of ${totalPages})`
        );

    
    }

    function handleSearch() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        const allRows = getAllRows();

        Array.from(allRows).forEach(row => {
            const nameCell = row.cells[1].textContent.toLowerCase();
            const shouldShow = nameCell.includes(searchTerm);
            row.setAttribute('data-visible', shouldShow);
        });

        currentPage = 1;
        updatePagination();
    }

    
    let searchTimeout;
    $('#searchInput').on('input', function () {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearch, 300); 
    });

    // Previous button click handler
    $('#prevBtn').on('click', function () {
        if (currentPage > 1) {
            currentPage--;
            updatePagination();
        }
    });

   
    $('#nextBtn').on('click', function () {
        const totalPages = Math.ceil(getVisibleRows().length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            updatePagination();
        }
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          
            btn.closest('tr').remove(); 
            refreshPagination();
        });
    });
    $('#successMessage').delay(3000).fadeOut();

    
    updatePagination();
});