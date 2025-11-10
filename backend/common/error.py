class Error(Exception):
    """Base class for exceptions in this module."""

    pass


class FileWriteFailError(Error):
    """Exception raised for errors if write file falied in development create.

    Attributes:
        file_name -- the name of write failed file
        message -- explanation of the error
    """

    def __init__(self, message, file_name=""):
        self.file_name = file_name
        self.message = message
